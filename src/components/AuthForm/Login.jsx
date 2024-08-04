import { Alert, AlertIcon, Button, Input } from "@chakra-ui/react";
import { useState } from "react";
import useLogin from "../../hooks/useLogin";

const Login = () => {
	const [inputs, setInputs] = useState({
		email: "",
		password: "",
	});
	const { loading, error, login } = useLogin();
	return (
		<>
			<Input
				placeholder='Email'
				fontSize={16}
				type='email'
				size={"sm"}
				bg={"charcoal"}
				value={inputs.email}
				onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
				_focus={{ 
					borderColor: 'transparent', // Make the border transparent
					boxShadow: '0 0 0 1px rgba(244, 164, 96, 0.5)' // Simulate a thinner border with box-shadow
				  }} 
			/>
			<Input
				placeholder='Password'
				fontSize={16}
				size={"sm"}
				bg={"charcoal"}
				type='password'
				value={inputs.password}
				onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
				_focus={{ 
					borderColor: 'transparent', // Make the border transparent
					boxShadow: '0 0 0 1px rgba(244, 164, 96, 0.5)' // Simulate a thinner border with box-shadow
				  }} 
			/>
			{error && (
				<Alert status='error' fontSize={13} p={2} borderRadius={4}>
					<AlertIcon fontSize={12} />
					{error.message}
				</Alert>
			)}
			<Button
				w={"full"}
				bg={"#eb7734"}
				color={"white"}
				_hover={{ bg: "#c75e1f" }}
				textShadow="2px 2px 4px rgba(0, 0, 0, 0.5)"
				size={{ base: "sm", md: "sm" }}
				isLoading={loading}
				onClick={() => login(inputs)}
			>
				Log in
			</Button>
		</>
	);
};

export default Login;
