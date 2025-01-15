import "mantou"; // Import the module

declare module "mantou" {
  interface Store {
    // Add or override properties here
    user?: string; // Example: Adding a `user` property
    settings?: { [key: string]: string }; // Example: Adding `settings`
  }
}