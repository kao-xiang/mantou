<div align="left" style="position: relative;">
<img src="https://cdn-icons-png.flaticon.com/512/6295/6295417.png" align="right" width="30%" style="margin: -20px 0 0 20px;">
<h1>MANTOU</h1>
<p align="left">
	<em>1 Line for types, routes and docs</em>
</p>
<p align="left">
	<img src="https://img.shields.io/github/license/ppenter/mantou?style=default&logo=opensourceinitiative&logoColor=white&color=0080ff" alt="license">
	<img src="https://img.shields.io/github/last-commit/ppenter/mantou?style=default&logo=git&logoColor=white&color=0080ff" alt="last-commit">
	<img src="https://img.shields.io/github/languages/top/ppenter/mantou?style=default&color=0080ff" alt="repo-top-language">
	<img src="https://img.shields.io/github/languages/count/ppenter/mantou?style=default&color=0080ff" alt="repo-language-count">
</p>
<p align="left"><!-- default option, no dependency badges. -->

</p>
<p align="left">
	<!-- default option, no dependency badges. -->
</p>
</div>
<br clear="right">

## 🔗 Table of Contents

- [📍 Overview](#-overview)
- [👾 Features](#-features)
- [📁 Project Structure](#-project-structure)
  - [📂 Project Index](#-project-index)
- [🚀 Getting Started](#-getting-started)
  - [☑️ Prerequisites](#-prerequisites)
  - [⚙️ Installation](#-installation)
  - [🤖 Usage](#🤖-usage)
  - [🧪 Testing](#🧪-testing)
- [🔰 Contributing](#-contributing)
- [🎗 License](#-license)
- [🙌 Acknowledgments](#-acknowledgments)

---
## Preview
<img src="./docs/images/Screenshot 2567-12-26 at 02.23.02.png"/>

## 📍 Overview

Mantou framework is a web development framework focusing on typesafe, clean code and technical excellence.

---

## 👾 Features

- [X] `File-based Routing`
- [X] `Typesafe`
- [X] `Autocomplete`
- [X] `Auto OpenAPI`
- [X] `Route Level Middlewares`
- [X] `App Router`
- [] `Websocket`
- [] `Plugins`

```sh
## 📁 Project Structure

└── mantou/
    ├── README.md
    ├── bun.lockb
    ├── eslint.config.js
    ├── example
    │   ├── mantou.config.ts
    │   ├── package.json
    │   ├── src
    │   │   └── routes
    │   │       └── route.ts
    │   └── tsconfig.json
    ├── index.ts
    ├── package.json
    ├── packages
    │   ├── create-mantou-app
    │   │   ├── .gitignore
    │   │   ├── README.md
    │   │   ├── package.json
    │   │   ├── src
    │   │   │   └── index.ts
    │   │   ├── templates
    │   │   │   └── basic
    │   │   └── tsconfig.json
    │   └── mantou
    │       ├── .gitignore
    │       ├── README.md
    │       ├── bun.lockb
    │       ├── package.json
    │       ├── src
    │       │   ├── cli
    │       │   ├── core
    │       │   ├── index.ts
    │       │   ├── lib
    │       │   ├── server
    │       │   └── types
    │       ├── tsconfig.json
    │       ├── tsconfig.types.json
    │       └── types
    │           ├── cli
    │           ├── core
    │           ├── index.d.ts
    │           ├── lib
    │           ├── server
    │           └── types
    ├── tsconfig.json
    └── yarn.lock
```


### 📂 Project Index
<details open>
	<summary><b><code>MANTOU/</code></b></summary>
	<details> <!-- __root__ Submodule -->
		<summary><b>__root__</b></summary>
		<blockquote>
			<table>
			<tr>
				<td><b><a href='https://github.com/ppenter/mantou/blob/master/tsconfig.json'>tsconfig.json</a></b></td>
				<td>- Configures TypeScript compiler settings for the project, enabling advanced JavaScript features and React JSX support while enforcing strict type-checking and best practices<br>- It optimizes module resolution for bundlers and prevents code emission, ensuring the project's robust structure and maintainability without compiling output files.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/ppenter/mantou/blob/master/index.ts'>index.ts</a></b></td>
				<td>- Initiates the application by logging a greeting message, specifically tailored for execution in the Bun JavaScript runtime environment<br>- Positioned at the root of the project structure, it serves as the entry point, setting the tone for the application's functionality and demonstrating basic output capabilities within the broader system architecture.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/ppenter/mantou/blob/master/package.json'>package.json</a></b></td>
				<td>- Serves as the configuration backbone for the Mantou project, defining build processes, managing dependencies, and setting up development environments<br>- It orchestrates the compilation and cleanup tasks essential for preparing the software for deployment, while also integrating linting and type-checking tools to ensure code quality and consistency across the project's modules.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/ppenter/mantou/blob/master/eslint.config.js'>eslint.config.js</a></b></td>
				<td>- Configures ESLint for a project, integrating standard JavaScript and TypeScript rules with specific customizations<br>- It sets global definitions for browser environments and adjusts rules to enhance code quality and consistency, such as indentation<br>- The configuration relaxes restrictions on several common warnings to suit the project's coding standards.</td>
			</tr>
			</table>
		</blockquote>
	</details>
	<details> <!-- packages Submodule -->
		<summary><b>packages</b></summary>
		<blockquote>
			<details>
				<summary><b>mantou</b></summary>
				<blockquote>
					<table>
					<tr>
						<td><b><a href='https://github.com/ppenter/mantou/blob/master/packages/mantou/tsconfig.json'>tsconfig.json</a></b></td>
						<td>- Configures TypeScript compiler settings for the Mantou package, enabling advanced JavaScript features and strict type-checking to enhance code quality and maintainability<br>- It sets up module resolution tailored for bundlers and specifies output directories for compiled code and type declarations, ensuring a structured and efficient development environment within the project's architecture.</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/ppenter/mantou/blob/master/packages/mantou/tsconfig.types.json'>tsconfig.types.json</a></b></td>
						<td>- Configures TypeScript compilation for the Mantou package, focusing on modern JavaScript features and strict type-checking<br>- It enables JavaScript file inclusion, generates type declarations, and sets up path aliases for simplified imports<br>- The configuration ensures the output is optimized for bundlers and excludes unnecessary directories from the compilation process.</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/ppenter/mantou/blob/master/packages/mantou/package.json'>package.json</a></b></td>
						<td>- Serves as the configuration center for the Mantou package, defining its structure, dependencies, and build scripts<br>- It facilitates the development and distribution of both the library and command-line interface components, ensuring compatibility and efficient project management through automated tasks for building, testing, and deployment.</td>
					</tr>
					</table>
					<details>
						<summary><b>types</b></summary>
						<blockquote>
							<table>
							<tr>
								<td><b><a href='https://github.com/ppenter/mantou/blob/master/packages/mantou/types/index.d.ts'>index.d.ts</a></b></td>
								<td>- Centralizes key exports and types for the Mantou module within the Elysia framework, facilitating the development of server applications<br>- It integrates essential components like controllers and handlers, and provides utilities such as guards for routing<br>- This setup enhances modularity and simplifies access to common functionalities across the project.</td>
							</tr>
							</table>
							<details>
								<summary><b>types</b></summary>
								<blockquote>
									<table>
									<tr>
										<td><b><a href='https://github.com/ppenter/mantou/blob/master/packages/mantou/types/types/controller.d.ts'>controller.d.ts</a></b></td>
										<td>- Defines a `Controller` class within the Mantou project, serving as a template for handling various HTTP methods including GET, POST, PUT, PATCH, and DELETE<br>- Each method can be optionally implemented to manage request contexts and return promises, facilitating flexible web service responses across different endpoints in the application's architecture.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/ppenter/mantou/blob/master/packages/mantou/types/types/server.d.ts'>server.d.ts</a></b></td>
										<td>- Defines the configuration options for server setup within the Mantou project, including development mode, port, host, SSL, middleware integration, and directory settings<br>- It also incorporates Swagger configuration for API documentation and CORS settings to manage cross-origin resource sharing, enhancing the project's modularity and scalability in networked environments.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/ppenter/mantou/blob/master/packages/mantou/types/types/core.d.ts'>core.d.ts</a></b></td>
										<td>- Defines core types and interfaces for the Mantou framework, including configurations for the framework itself and plugins<br>- It introduces a Plugin type for extending functionality, a FrameworkConfig for setup options, and a GuardFunction for security checks, alongside HttpMethod types to standardize HTTP operations across the application.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/ppenter/mantou/blob/master/packages/mantou/types/types/shema.d.ts'>shema.d.ts</a></b></td>
										<td>- Defines a series of TypeScript types and utility functions for schema validation, focusing on type safety and transformation between input and output types<br>- It includes basic schemas for strings, numbers, and booleans, and a composite object schema that aggregates other schemas, facilitating structured data validation across the codebase.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/ppenter/mantou/blob/master/packages/mantou/types/types/handler.d.ts'>handler.d.ts</a></b></td>
										<td>- Defines the structure for handling HTTP route contexts within the Mantou project, specifying the types for query parameters, URL parameters, request bodies, and headers<br>- It also includes mechanisms for setting response headers and status codes, ensuring consistent interaction handling across the application's server-side components.</td>
									</tr>
									</table>
								</blockquote>
							</details>
							<details>
								<summary><b>lib</b></summary>
								<blockquote>
									<table>
									<tr>
										<td><b><a href='https://github.com/ppenter/mantou/blob/master/packages/mantou/types/lib/fs.d.ts'>fs.d.ts</a></b></td>
										<td>- Exported from the `packages/mantou/types/lib/fs.d.ts`, the `loadConfig` function plays a crucial role in asynchronously loading configuration settings, potentially from a specified path<br>- It serves as a foundational component within the broader codebase, facilitating dynamic configuration management essential for the application's adaptability and scalability.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/ppenter/mantou/blob/master/packages/mantou/types/lib/logger.d.ts'>logger.d.ts</a></b></td>
										<td>- Exports a logger instance from the Consola library, which is utilized across the entire codebase for logging purposes<br>- Positioned within the `types/lib` directory of the `mantou` package, it standardizes how messages are logged, aiding in debugging and providing consistent log output format and behavior throughout the application's various components.</td>
									</tr>
									</table>
								</blockquote>
							</details>
							<details>
								<summary><b>core</b></summary>
								<blockquote>
									<table>
									<tr>
										<td><b><a href='https://github.com/ppenter/mantou/blob/master/packages/mantou/types/core/types.d.ts'>types.d.ts</a></b></td>
										<td>- Serves as a placeholder or initializer within the 'mantou' package, specifically under the 'types' module for TypeScript definitions<br>- Its presence likely indicates a setup for further expansion or a structural requirement in the broader codebase, ensuring proper type definitions are maintained and accessible across different components of the project.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/ppenter/mantou/blob/master/packages/mantou/types/core/file-base-router.d.ts'>file-base-router.d.ts</a></b></td>
										<td>- Defines routing utilities for the Elysia framework within the Mantou project, enabling the creation, configuration, and guarding of routes<br>- It facilitates the handling of different content types and integrates schema validation for request and response data, enhancing API structure and security.</td>
									</tr>
									</table>
								</blockquote>
							</details>
							<details>
								<summary><b>cli</b></summary>
								<blockquote>
									<table>
									<tr>
										<td><b><a href='https://github.com/ppenter/mantou/blob/master/packages/mantou/types/cli/index.d.ts'>index.d.ts</a></b></td>
										<td>- Serves as a TypeScript declaration file within the Mantou project, specifically for the CLI tooling<br>- Positioned in the types directory, it ensures type safety and enhances developer tooling by providing TypeScript definitions for the CLI functionalities, facilitating easier maintenance and scalability of the command-line interface components across the project.</td>
									</tr>
									</table>
								</blockquote>
							</details>
							<details>
								<summary><b>server</b></summary>
								<blockquote>
									<table>
									<tr>
										<td><b><a href='https://github.com/ppenter/mantou/blob/master/packages/mantou/types/server/index.test.d.ts'>index.test.d.ts</a></b></td>
										<td>- Serves as a placeholder or stub within the server types package of the Mantou project, likely facilitating type checking or integration testing without adding actual functionality<br>- Positioned in the test directory, it underscores the project's emphasis on maintaining robust type definitions across different modules for enhanced scalability and maintainability.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/ppenter/mantou/blob/master/packages/mantou/types/server/index.d.ts'>index.d.ts</a></b></td>
										<td>- Defines a function to initialize and start a server using the Elysia framework, configured with specific server options<br>- The function ensures the server is set up with customized configurations for decorators, stores, and schema management, enhancing the server's functionality and integration within the broader application architecture.</td>
									</tr>
									</table>
								</blockquote>
							</details>
						</blockquote>
					</details>
					<details>
						<summary><b>src</b></summary>
						<blockquote>
							<table>
							<tr>
								<td><b><a href='https://github.com/ppenter/mantou/blob/master/packages/mantou/src/index.ts'>index.ts</a></b></td>
								<td>- Serves as the central export hub for the Mantou module within the Elysia framework, facilitating the integration and utilization of core functionalities such as routing and server options management<br>- It provides streamlined access to essential components like controllers and handlers, enhancing modularity and ease of use in web application development.</td>
							</tr>
							</table>
							<details>
								<summary><b>types</b></summary>
								<blockquote>
									<table>
									<tr>
										<td><b><a href='https://github.com/ppenter/mantou/blob/master/packages/mantou/src/types/controller.ts'>controller.ts</a></b></td>
										<td>- Defines a Controller class within the Mantou package, outlining potential HTTP methods such as GET, POST, PUT, PATCH, and DELETE<br>- Each method is designed to handle respective requests, facilitating the creation of a versatile and scalable server-side logic framework that can be extended or customized for various application needs within the broader project architecture.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/ppenter/mantou/blob/master/packages/mantou/src/types/server.ts'>server.ts</a></b></td>
										<td>- Defines the configuration options for a server within the Mantou module, part of a larger framework<br>- It includes settings for development mode, server port, host, SSL, middleware integration, directory paths, Swagger documentation configuration, and CORS settings<br>- This interface is crucial for initializing server instances with customized settings across different environments.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/ppenter/mantou/blob/master/packages/mantou/src/types/handler.ts'>handler.ts</a></b></td>
										<td>- Defines the structure for route handling within the Mantou package, specifying the types for query parameters, URL parameters, request bodies, and headers<br>- It also includes a mechanism for setting response headers and status codes, ensuring consistent interaction handling across the application's network communication layer<br>- This setup is crucial for maintaining robust and scalable server-side logic.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/ppenter/mantou/blob/master/packages/mantou/src/types/shema.ts'>shema.ts</a></b></td>
										<td>- Defines a set of TypeScript types and utilities for schema validation within the Mantou project, facilitating type-safe input and output operations across various data types including strings, numbers, booleans, and objects<br>- It ensures consistent data handling and validation logic throughout the application's architecture.</td>
									</tr>
									</table>
								</blockquote>
							</details>
							<details>
								<summary><b>lib</b></summary>
								<blockquote>
									<table>
									<tr>
										<td><b><a href='https://github.com/ppenter/mantou/blob/master/packages/mantou/src/lib/logger.ts'>logger.ts</a></b></td>
										<td>- Establishes a centralized logging system within the Mantou project, utilizing the Consola library to create a consistent logging interface<br>- This setup enhances debugging and monitoring across the application by providing a unified mechanism for outputting diagnostic messages, crucial for maintaining the robustness and traceability of the software throughout its components.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/ppenter/mantou/blob/master/packages/mantou/src/lib/fs.ts'>fs.ts</a></b></td>
										<td>- LoadConfig, defined in `packages/mantou/src/lib/fs.ts`, serves as a crucial function within the codebase, responsible for dynamically importing and handling configuration from a specified path, defaulting to "mantou.config.js"<br>- It ensures configurations are loaded correctly, providing fallbacks and error handling to maintain robustness in the system's configuration management process.</td>
									</tr>
									</table>
								</blockquote>
							</details>
							<details>
								<summary><b>core</b></summary>
								<blockquote>
									<table>
									<tr>
										<td><b><a href='https://github.com/ppenter/mantou/blob/master/packages/mantou/src/core/file-base-router.ts'>file-base-router.ts</a></b></td>
										<td>- Defines and manages the routing logic within the Mantou project, dynamically resolving and registering routes and middleware based on file structure<br>- It utilizes schema validation to ensure data integrity and supports dynamic route handling, enhancing the application's scalability and maintainability by automating route setup and validation processes.</td>
									</tr>
									</table>
								</blockquote>
							</details>
							<details>
								<summary><b>cli</b></summary>
								<blockquote>
									<table>
									<tr>
										<td><b><a href='https://github.com/ppenter/mantou/blob/master/packages/mantou/src/cli/index.ts'>index.ts</a></b></td>
										<td>- Manages the Mantou framework's command-line interface, enabling developers to start both development and production servers<br>- Features include hot reloading during development through file watching and graceful shutdown capabilities<br>- It handles server restarts on file changes and manages environmental settings for different deployment stages.</td>
									</tr>
									</table>
								</blockquote>
							</details>
							<details>
								<summary><b>server</b></summary>
								<blockquote>
									<table>
									<tr>
										<td><b><a href='https://github.com/ppenter/mantou/blob/master/packages/mantou/src/server/index.ts'>index.ts</a></b></td>
										<td>- Initializes and configures a server using the Elysia framework, integrating environment settings, logging, and optional features like Swagger API documentation and CORS<br>- It dynamically loads and applies route configurations from a specified directory, and launches the server, logging the startup details.</td>
									</tr>
									</table>
								</blockquote>
							</details>
						</blockquote>
					</details>
				</blockquote>
			</details>
			<details>
				<summary><b>create-mantou-app</b></summary>
				<blockquote>
					<table>
					<tr>
						<td><b><a href='https://github.com/ppenter/mantou/blob/master/packages/create-mantou-app/tsconfig.json'>tsconfig.json</a></b></td>
						<td>- Configures TypeScript compiler options for the `create-mantou-app` package, enabling the latest JavaScript features and React JSX support<br>- It sets strict coding standards while allowing JavaScript files, ensuring robust and modern code practices<br>- This configuration is pivotal for maintaining code quality and compatibility across the development environment in the project's architecture.</td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/ppenter/mantou/blob/master/packages/create-mantou-app/package.json'>package.json</a></b></td>
						<td>- Serves as the core component for the `create-mantou-app` package, enabling the scaffolding of new applications using the Mantou framework<br>- It includes scripts for development and building the distribution, manages dependencies necessary for the project setup, and integrates command-line utilities to streamline application creation<br>- The package connects to the main Mantou repository for updates and collaborative enhancements.</td>
					</tr>
					</table>
					<details>
						<summary><b>src</b></summary>
						<blockquote>
							<table>
							<tr>
								<td><b><a href='https://github.com/ppenter/mantou/blob/master/packages/create-mantou-app/src/index.ts'>index.ts</a></b></td>
								<td>- Facilitates the creation of new Mantou applications by setting up a project structure based on user-defined options such as project name and template choice<br>- It automates the generation of a configured `package.json`, and provides commands for development, building, and running the application, enhancing the setup experience for developers.</td>
							</tr>
							</table>
						</blockquote>
					</details>
					<details>
						<summary><b>templates</b></summary>
						<blockquote>
							<details>
								<summary><b>basic</b></summary>
								<blockquote>
									<table>
									<tr>
										<td><b><a href='https://github.com/ppenter/mantou/blob/master/packages/create-mantou-app/templates/basic/tsconfig.json'>tsconfig.json</a></b></td>
										<td>- Configures TypeScript compilation settings for a basic application template within the 'create-mantou-app' package<br>- It specifies modern JavaScript features, strict type-checking, and custom path resolutions to enhance development practices<br>- The configuration ensures no output files are emitted, directing type declarations to a specific directory, thereby streamlining the development and build process.</td>
									</tr>
									<tr>
										<td><b><a href='https://github.com/ppenter/mantou/blob/master/packages/create-mantou-app/templates/basic/mantou.config.ts'>mantou.config.ts</a></b></td>
										<td>- Configures server options for a basic Mantou application, specifically setting up Swagger documentation at the '/docs' path<br>- It outlines the API's title, description, version, and security protocols, including JWT authentication for secure access<br>- This configuration is crucial for API documentation and security setup within the project's architecture.</td>
									</tr>
									</table>
									<details>
										<summary><b>src</b></summary>
										<blockquote>
											<details>
												<summary><b>routes</b></summary>
												<blockquote>
													<table>
													<tr>
														<td><b><a href='https://github.com/ppenter/mantou/blob/master/packages/create-mantou-app/templates/basic/src/routes/route.ts'>route.ts</a></b></td>
														<td>- Defines a route within the Mantou application framework, implementing an authentication guard to restrict access based on user roles<br>- Specifically, it sets up a GET route that returns a simple greeting, but only allows access to users with the 'buyer' role, ensuring role-based access control within the application's routing logic.</td>
													</tr>
													</table>
												</blockquote>
											</details>
										</blockquote>
									</details>
								</blockquote>
							</details>
						</blockquote>
					</details>
				</blockquote>
			</details>
		</blockquote>
	</details>
	<details> <!-- example Submodule -->
		<summary><b>example</b></summary>
		<blockquote>
			<table>
			<tr>
				<td><b><a href='https://github.com/ppenter/mantou/blob/master/example/tsconfig.json'>tsconfig.json</a></b></td>
				<td>- Configures TypeScript compiler settings for a project, enabling the latest JavaScript features and strict type-checking to ensure code quality<br>- It sets up path aliases for simpler imports and specifies output directories for compiled code and type declarations, enhancing modularity and maintainability of the codebase.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/ppenter/mantou/blob/master/example/mantou.config.ts'>mantou.config.ts</a></b></td>
				<td>- Configures server options for the Mantou project, specifically setting up Swagger documentation accessible at '/docs'<br>- It details API information including title, description, and version, and establishes security protocols using JWT authentication<br>- This setup enhances API usability and security, centralizing configuration in a single module within the project architecture.</td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/ppenter/mantou/blob/master/example/package.json'>package.json</a></b></td>
				<td>- Manages the build and development setup for the 'example' module within the project, specifying dependencies and scripts for operations like development, starting the server, and building the project<br>- It utilizes 'mantou' for task automation and 'typescript' for type checking, ensuring the module's compatibility and functionality as part of the broader system architecture.</td>
			</tr>
			</table>
			<details>
				<summary><b>src</b></summary>
				<blockquote>
					<details>
						<summary><b>routes</b></summary>
						<blockquote>
							<table>
							<tr>
								<td><b><a href='https://github.com/ppenter/mantou/blob/master/example/src/routes/route.ts'>route.ts</a></b></td>
								<td>- Defines a route within the application that incorporates an authentication guard<br>- The guard checks if the user has the 'buyer' role before allowing access to the route<br>- Upon successful authentication, the route responds with a simple greeting message<br>- This setup ensures that certain functionalities are restricted to authenticated users with specific roles.</td>
							</tr>
							</table>
						</blockquote>
					</details>
				</blockquote>
			</details>
		</blockquote>
	</details>
</details>

---
## 🚀 Getting Started

### ☑️ Prerequisites

Before getting started with mantou, ensure your runtime environment meets the following requirements:

- **Programming Language:** TypeScript
- **Package Manager:** Bun


**Using `npm`** &nbsp; [<img align="center" src="https://img.shields.io/badge/npm-CB3837.svg?style={badge_style}&logo=npm&logoColor=white" />](https://www.npmjs.com/)

```sh
❯ npm install
```




### 🤖 Usage
Using mantou framework
**Using `bunx`** &nbsp; [<img align="center" src="" />]()

```
❯ bunx create-mantou-app
```

```
❯ cd <project-dir>
```

```
❯ bun run dev
```


### 🧪 Testing

TODO


---

## 🔰 Contributing

- **💬 [Join the Discussions](https://github.com/ppenter/mantou/discussions)**: Share your insights, provide feedback, or ask questions.
- **🐛 [Report Issues](https://github.com/ppenter/mantou/issues)**: Submit bugs found or log feature requests for the `mantou` project.
- **💡 [Submit Pull Requests](https://github.com/ppenter/mantou/blob/main/CONTRIBUTING.md)**: Review open PRs, and submit your own PRs.

<details closed>
<summary>Contributing Guidelines</summary>

1. **Fork the Repository**: Start by forking the project repository to your github account.
2. **Clone Locally**: Clone the forked repository to your local machine using a git client.
   ```sh
   git clone https://github.com/ppenter/mantou
   ```
3. **Create a New Branch**: Always work on a new branch, giving it a descriptive name.
   ```sh
   git checkout -b new-feature-x
   ```
4. **Make Your Changes**: Develop and test your changes locally.
5. **Commit Your Changes**: Commit with a clear message describing your updates.
   ```sh
   git commit -m 'Implemented new feature x.'
   ```
6. **Push to github**: Push the changes to your forked repository.
   ```sh
   git push origin new-feature-x
   ```
7. **Submit a Pull Request**: Create a PR against the original project repository. Clearly describe the changes and their motivations.
8. **Review**: Once your PR is reviewed and approved, it will be merged into the main branch. Congratulations on your contribution!
</details>

<details closed>
<summary>Contributor Graph</summary>
<br>
<p align="left">
   <a href="https://github.com{/ppenter/mantou/}graphs/contributors">
      <img src="https://contrib.rocks/image?repo=ppenter/mantou">
   </a>
</p>
</details>

---

## 🎗 License

This project is protected under the [SELECT-A-LICENSE](https://choosealicense.com/licenses) License. For more details, refer to the [LICENSE](https://choosealicense.com/licenses/) file.

---

## 🙌 Acknowledgments

- List any resources, contributors, inspiration, etc. here.

---