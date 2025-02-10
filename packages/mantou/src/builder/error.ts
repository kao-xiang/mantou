import { redirect } from "elysia";

export const handlerError = (error: any) => {
  if (typeof window !== "undefined") {
    // alert(error.message);
  }
  if (typeof window === "undefined") {
    const type = error.type;
    switch (type) {
      case "mantou/redirect":
        redirect(error.url);
        break;
      default:
        console.error(error);
    }
  }
};
