# API Express (Typescrypt)

This API was developed based on the series of posts from Toptal, which the first
article can be accessed [here](https://www.toptal.com/express-js/nodejs-typescript-rest-api-pt-1).

The idea was to develop an user registration API with Express, Typescript and
MongoDB, including authentication and authorization, with JWT and permissions
levels.

All files are in the [src folder](src/). Except for [tests](src/tests), all
features are grouped together with their functionalities. Everything related to
users is in the [users folder](src/routes/users) and everything related to auth is in
the [auth folder](src/routes/auth). There is also a [common folder](src/routes/common)
for functionalities there are nedded for both users and auth.

## Endpoints

There are endpoints for users and auth, which are described below. The permissions
levels described can be found in the enum in [this file](src/routes/common/enums/common.permissionsFlags.enum.ts).

### Users

The endpoints for users can be found in the [users routes config file](src/routes/users/users.routes.config.ts).

- */users*:
  - Methods:
    - GET: retrieve all users in the database. The Permissions Middleware implemented
guarantees that only users with **Admin** level of permission can get all users from
the database.
    - POST: creates a new user. This method is public and anyone can create a new
user. The newly created user will have **Free** permission level, the most basic.
The *validateSameEmailDoesntExist* middleware insures that there will not be duplicated
emails in the database.

- */users/:userId*:
  - All methods for this endpoint have common middlewares, such as to validate the
*userId* passed really exists, verifying if the request contains a valid JWT and
checking if the request was made by the user that the id belongs or by an admin.
  - Methods:
    - GET: retrieve all fields from an user. The middlewares implemented above validate
that this action is performed by the user themself or by an admin.
    - DELETE: removes an user. The middlewares are similar to the *GET* method described
above.
    - PUT: update all fields from an user. The middlewares validate that all required
fields are present, validate once more that the e-mail belongs to the user, validate
that the user don't modify their permissions and only allows users with **Paid**
permission to change their fields. An admin cannot change user fields.
    - PATCH: update one or more fields from an user. The middlewares are similar to
those in the *PUT* method.
  - One can wonder if it is necessary to have both *PUT* and *PATCH* methods for an
endpoint. In most cases, only *PATCH* is necessary, but here, both are present just
to stick the a *RESTful* API standard.

- */users/:userId/permissionFlags/:permissionFlags*:
  - This endpoint was introduced to be a helper for tests. With this, an user can
modify their permissions. This should not be present in a production API and will
probably be removed in future versions.

### Auth

The endpoints for users can be found in the [auth routes config file](src/routes/auth/auth.routes.config.ts).

- */auth*:
  - Methods:
    - POST: this acts as the login endpoint. The middlewares check if all required
fields are present and if the password informed match with the hashed stored password.
Then, it creates a JWT to be attached with the next requests made by the user.

- */auth/refresh-token*:
  - Methods:
    - POST: this endpoint verifies the token sent by the request and checks if it is
necessary to update it. If it is, a new JWT is generated and attached to the response.

## Necessary improvements

This first version works but, as usual, there are points to improve. The ones I highlight
are:

- Allow an user to be created as an admin, based on certain criteria.
- Only allow an admin to update an user permissions level.
- Generate a salt to use when hashing a password to save in the database.
- Use a different database for tests.
- Decouple user tests from auth tests.

## Final thoughts

This API was created as an effort to understand better the creation of API's with
Javascript and Typescript. I appreciate any constructive feedback on how to improve
my code and to improve this product. You can reach me in the following links:

- [Instagram](https://www.instagram.com/brennercsferreira)
- [LinkedIn](https://www.linkedin.com/in/brennercsferreira)
