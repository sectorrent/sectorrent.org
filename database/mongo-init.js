db = db.getSiblingDB('admin');

db.createUser(
    {
        user: "admin",
        pwd: "=v=rT4K%{xUa@VVYLM-v/kt57AitfpUM",
        roles: [
            {
                role: "root",
                db: "admin"
            }
        ]
    }
);
