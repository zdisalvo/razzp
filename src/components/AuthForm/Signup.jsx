import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { Alert, AlertIcon, Button, Input, InputGroup, InputRightElement } from "@chakra-ui/react";
import { useState } from "react";
import useSignUpWithEmailAndPassword from "../../hooks/useSignUpWithEmailAndPassword";

const Signup = () => {
	const [inputs, setInputs] = useState({
		fullName: "",
		username: "",
		email: "",
		password: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const { loading, error, signup } = useSignUpWithEmailAndPassword();

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
				placeholder='Username'
				fontSize={16}
				type='text'
				size={"sm"}
				bg={"charcoal"}
				value={inputs.username}
				onChange={(e) => setInputs({ ...inputs, username: e.target.value })}
				_focus={{ 
					borderColor: 'transparent', // Make the border transparent
					boxShadow: '0 0 0 1px rgba(244, 164, 96, 0.5)' // Simulate a thinner border with box-shadow
				  }} 
			/>
			<Input
				placeholder='Full Name'
				fontSize={16}
				type='text'
				size={"sm"}
				bg={"charcoal"}
				value={inputs.fullName}
				onChange={(e) => setInputs({ ...inputs, fullName: e.target.value })}
				_focus={{ 
					borderColor: 'transparent', // Make the border transparent
					boxShadow: '0 0 0 1px rgba(244, 164, 96, 0.5)' // Simulate a thinner border with box-shadow
				  }} 
			/>
			<InputGroup>
				<Input
					placeholder='Password'
					fontSize={16}
					type={showPassword ? "text" : "password"}
					value={inputs.password}
					size={"sm"}
					bg={"charcoal"}
					onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
					_focus={{ 
						borderColor: 'transparent', // Make the border transparent
						boxShadow: '0 0 0 1px rgba(244, 164, 96, 0.5)' // Simulate a thinner border with box-shadow
					  }} 
				/>
				<InputRightElement h='full'>
					<Button variant={"ghost"} size={"sm"} onClick={() => setShowPassword(!showPassword)}>
						{showPassword ? <ViewIcon /> : <ViewOffIcon />}
					</Button>
				</InputRightElement>
			</InputGroup>

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
				onClick={() => signup(inputs)}
			>
				Sign Up
			</Button>
		</>
	);
};

export default Signup;
