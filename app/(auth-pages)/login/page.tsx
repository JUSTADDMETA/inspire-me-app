import { login, signup } from './actions';

export default function LoginPage() {
  return (
    <form className="flex flex-col items-center p-6 bg-gray-100 rounded-md shadow-md max-w-sm mx-auto space-y-4">
      <label htmlFor="email" className="text-gray-700 font-semibold">
        Email:
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <label htmlFor="password" className="text-gray-700 font-semibold">
        Password:
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex w-full space-x-4">
        <button
          formAction={login}
          className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Log in
        </button>
        <button
          formAction={signup}
          className="w-full p-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
        >
          Sign up
        </button>
      </div>
    </form>
  );
}



/*import { login, signup } from './actions'

export default function LoginPage() {
  return (
    <form>
      <label htmlFor="email">Email:</label>
      <input id="email" name="email" type="email" required />
      <label htmlFor="password">Password:</label>
      <input id="password" name="password" type="password" required />
      <button formAction={login}>Log in</button>
      <button formAction={signup}>Sign up</button>
    </form>
  )
}*/