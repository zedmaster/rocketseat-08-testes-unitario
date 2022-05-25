import { Connection, createConnection } from "typeorm";
import { v4 as uuidv4 } from "uuid";

import { UsersRepository } from "../../../../modules/users/repositories/UsersRepository";
import { CreateUserUseCase } from "../../../../modules/users/useCases/createUser/CreateUserUseCase";
import { ShowUserProfileUseCase } from "../../../../modules/users/useCases/showUserProfile/ShowUserProfileUseCase";
import { ShowUserProfileError } from "../../../../modules/users/useCases/showUserProfile/ShowUserProfileError";

describe("ShowUserProfileUseCase", () => {
  let connection: Connection;

  let usersRepository: UsersRepository;

  let createUserUseCase: CreateUserUseCase;
  let showUserProfileUseCase: ShowUserProfileUseCase;

  beforeAll(async () => {
    connection = await createConnection();

    usersRepository = new UsersRepository();

    createUserUseCase = new CreateUserUseCase(usersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository);

    await connection.createQueryRunner().dropTable("statements", true);
    await connection.createQueryRunner().dropTable("users", true);
    await connection.createQueryRunner().dropTable("migrations", true);
    await connection.runMigrations();
  });

  afterAll(() => {
    connection.close();
  });

  it("should be able to show the profile", async () => {
    const user = await createUserUseCase.execute({
      email: "zedmaster@gmail.com",
      password: "123456",
      name: "Zed Master",
    });

    const response = await showUserProfileUseCase.execute(String(user.id));

    expect(response.name).toBe("Zed Master");
    expect(response.email).toBe("zedmaster@gmail.com");
  });

  it("should not be able to show the profile from non-existing user", async () => {
    await expect(showUserProfileUseCase.execute(uuidv4())).rejects.toBeInstanceOf(
      ShowUserProfileError
    );
  });
});
