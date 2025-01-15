import { handler } from "mantou";

export default handler(async (context) => {
    console.log("Hello, world! (Middleware)");
    return {
        status: 200,
        body: {
        message: "Hello, world!",
        },
    };
});