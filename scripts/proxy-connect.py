#!/usr/bin/env python3
"""SSH ProxyCommand: tunnel to host:port through the HTTP proxy in HTTPS_PROXY env.
Usage: proxy-connect.py <host> <port>"""
import base64
import os
import select
import socket
import sys
from urllib.parse import urlparse


def main():
    host, port = sys.argv[1], int(sys.argv[2])
    proxy = urlparse(os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy"))
    s = socket.create_connection((proxy.hostname, proxy.port), timeout=30)
    auth = ""
    if proxy.username:
        creds = f"{proxy.username}:{proxy.password or ''}".encode()
        auth = "Proxy-Authorization: Basic " + base64.b64encode(creds).decode() + "\r\n"
    s.sendall(f"CONNECT {host}:{port} HTTP/1.1\r\nHost: {host}:{port}\r\n{auth}\r\n".encode())
    buf = b""
    while b"\r\n\r\n" not in buf:
        chunk = s.recv(4096)
        if not chunk:
            sys.exit("proxy closed connection during CONNECT")
        buf += chunk
    status = buf.split(b"\r\n", 1)[0]
    if b" 200 " not in status and not status.endswith(b" 200"):
        sys.exit(f"proxy CONNECT failed: {status!r}")
    rest = buf.split(b"\r\n\r\n", 1)[1]
    if rest:
        sys.stdout.buffer.write(rest)
        sys.stdout.buffer.flush()

    s.setblocking(False)
    stdin_fd = sys.stdin.buffer.fileno()
    os.set_blocking(stdin_fd, False)
    sock_fd = s.fileno()
    while True:
        r, _, _ = select.select([sock_fd, stdin_fd], [], [], 60)
        if sock_fd in r:
            try:
                data = s.recv(65536)
            except BlockingIOError:
                data = b""
            if not data:
                return
            sys.stdout.buffer.write(data)
            sys.stdout.buffer.flush()
        if stdin_fd in r:
            data = os.read(stdin_fd, 65536)
            if not data:
                try:
                    s.shutdown(socket.SHUT_WR)
                except OSError:
                    pass
                continue
            s.sendall(data)


if __name__ == "__main__":
    main()
