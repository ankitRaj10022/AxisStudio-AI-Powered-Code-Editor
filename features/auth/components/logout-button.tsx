import React from "react";
import { signOut } from "next-auth/react";
import { LogoutButtonProps } from "../types";

const LogoutButton = ({ children }: LogoutButtonProps) => {
  const onLogout = async () => {
    await signOut({ redirect: false });
    window.location.replace("/auth/sign-in");
  };

  return (
    <span className="cursor-pointer" onClick={onLogout}>
      {children}
    </span>
  );
};

export default LogoutButton;
