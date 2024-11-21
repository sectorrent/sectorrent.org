COLLECTIONS
-----
- users
- categories
- threads
- comments

Users
-----
- Ensure we have unique usernames - case insensitive
```json
{
    "email": "ted.bundy@sectorrent.org",
    "username": "Ted_Bundy",
    "fname": "Ted",
    "lname": "Bundy",
    "password": "BLOWFISH_HASH",
    "created": 1000000,
    "role": 0,
    "avatar": "IMAGE_SHA256_HASH"
}
```

Categories
-----
```json
{
    "title": "News",
    "description": "Something about news",
    "slug": "news"
}
```

Threads
-----
- We must allow for images and links, bold and italic text.
```json
{
    "title": "TOR",
    "user": ObjectId("asdasdasd"),
    "content": "",
    "pinned": true,
    "locked": true,
    "categories": [
        ObjectId("asdasdasd")
    ],
    "created": 1000000,
    "views": 0
}
```

Comments
-----
- We must allow for images and links, bold and italic text.
```json
{
    "thread": ObjectId("asdasdasd"),
    "user": ObjectId("asdasdasd"),
    "reply": ObjectId("asdasdasd"),
    "content": "",
    "pinned": true,
    "created": 1000000
}
```
