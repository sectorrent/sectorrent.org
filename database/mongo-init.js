db = db.getSiblingDB('admin');

db.createUser(
    {
        user: "admin",
        pwd: "password",
        roles: [
            {
                role: "root",
                db: "admin"
            }
        ]
    }
);
