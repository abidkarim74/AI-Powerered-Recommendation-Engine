import bcrypt


class Hashing:
    def hash(self, password: str) -> bytes:
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        return hashed_password.decode("utf-8")

    def verify(self, raw_password: str, hashed_password: bytes | str) -> bool:
        if isinstance(hashed_password, str):
            hashed_password = hashed_password.encode('utf-8')
        
        return bcrypt.checkpw(raw_password.encode('utf-8'), hashed_password)


hashing = Hashing()

if __name__ == '__main__':
    hashed = hashing.hash('ys2b7kat')
    print(hashed)
    print(hashing.verify('ys2b7kat-', hashed))