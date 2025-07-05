import { useState } from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  useToast,
} from '@chakra-ui/react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

export default function ContactForm({ tour }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const toast = useToast();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!executeRecaptcha) {
      return;
    }
    const token = await executeRecaptcha('contact_form');

    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, message, token, tour }),
    });

    if (res.ok) {
      toast({
        title: 'Inquiry sent.',
        description: "We've received your inquiry and will get back to you soon.",
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } else {
      toast({
        title: 'Error.',
        description: 'Something went wrong. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormControl isRequired>
        <FormLabel>Name</FormLabel>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </FormControl>
      <FormControl isRequired mt={4}>
        <FormLabel>Email</FormLabel>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </FormControl>
      <FormControl mt={4}>
        <FormLabel>Message</FormLabel>
        <Textarea value={message} onChange={(e) => setMessage(e.target.value)} />
      </FormControl>
      <Button mt={4} colorScheme="teal" type="submit">
        Send Inquiry
      </Button>
    </form>
  );
}
