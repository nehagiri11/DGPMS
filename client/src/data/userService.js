import { users as defaultUsers }
from "./users";

export const initializeUsers =
() => {

  if (
    !localStorage.getItem(
      "users"
    )
  ) {

    localStorage.setItem(
      "users",
      JSON.stringify(
        defaultUsers
      )
    );

  }

};

export const getUsers = () => {

  initializeUsers();

  return (
    JSON.parse(
      localStorage.getItem(
        "users"
      )
    ) || []
  );

};

export const addUser =
(user) => {

  const users =
    getUsers();

  users.push(user);

  localStorage.setItem(
    "users",
    JSON.stringify(users)
  );

};

export const deleteUser =
(email) => {

  const users =
    getUsers();

  const updated =
    users.filter(
      (u) =>
        u.email !== email
    );

  localStorage.setItem(
    "users",
    JSON.stringify(updated)
  );

};
export const approveUser =
(email) => {

  const users =
    getUsers();

  const updated =
    users.map((u) =>

      u.email === email
        ? {
            ...u,
            approved: true,
          }
        : u

    );

  localStorage.setItem(
    "users",
    JSON.stringify(updated)
  );

};

export const updateUser = (
  email,
  updatedData
) => {

  const users =
    getUsers();

  const updatedUsers =
    users.map((user) =>

      user.email === email

        ? {
            ...user,
            ...updatedData,
          }

        : user

    );

  localStorage.setItem(
    "users",
    JSON.stringify(
      updatedUsers
    )
  );

};
