export const users = [
  {
    name: "Neha",
    email: "neha.giri@laxmimotorcorp.com",
    password: "123456",
    role: "REQUESTER",
    approved: true,
  },

  {
    name: "Test Employee",
    email: "try@laxmimotorcorp.com",
    password: "123456",
    role: "REQUESTER",
    approved: true,
  },

  {
    name: "Manager",
    email: "manager@laxmimotorcorp.com",
    password: "123456",
    role: "APPROVER",
    approved: true,
  },


  {
    email: "security@laxmimotorcorp.com",
    password: "123456",
    role: "SECURITY",
    approved: true,
  },

  {
    email: "admin@laxmimotorcorp.com",
    password: "123456",
    role: "ADMIN",
    approved: true,
  },

  {
    email: "pending@laxmimotorcorp.com",
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

