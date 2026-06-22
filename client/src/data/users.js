export const users = [
  {
    name: "Neha",
    email: "neha.giri@laxmimotocorp.com",
    password: "123456",
    role: "REQUESTER",
    approved: true,
  },

  {
    name: "Test Employee",
    email: "try@laxmimotocorp.com",
    password: "123456",
    role: "REQUESTER",
    approved: true,
  },

  {
    name: "Manager",
    email: "manager@laxmimotocorp.com",
    password: "123456",
    role: "APPROVER",
    approved: true,
  },


  {
    email: "security@laxmimotocorp.com",
    password: "123456",
    role: "SECURITY",
    approved: true,
  },

  {
    email: "admin@laxmimotocorp.com",
    password: "123456",
    role: "ADMIN",
    approved: true,
  },

  {
    email: "pending@laxmimotocorp.com",
    password: "123456",
    role: "EMPLOYEE",
    approved: false,
  },
];
export const getUsers = () => {

  return (
    JSON.parse(
      localStorage.getItem(
        "users"
      )
    ) || []
  );

};

export const saveUsers = (
  users
) => {

  localStorage.setItem(

    "users",

    JSON.stringify(users)

  );

};

export const addUser = (
  user
) => {

  const users =
    getUsers();

  users.push(user);

  saveUsers(users);

};

export const deleteUser = (
  email
) => {

  const users =
    getUsers();

  const updated =
    users.filter(

      (user) =>

        user.email !==
        email

    );

  saveUsers(updated);

};

export const updateUser = (

  email,

  updatedUser

) => {

  const users =
    getUsers();

  const updated =
    users.map(

      (user) =>

        user.email === email

          ? {
              ...user,
              ...updatedUser,
            }

          : user

    );

  saveUsers(updated);

  localStorage.setItem(
    "users",
    JSON.stringify(updatedUsers)
  );


};

