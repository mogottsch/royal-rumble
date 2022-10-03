import Button from '@mui/material/Button';
import Input from '@mui/material/Input'
import { Form } from "react-router-dom";

export default function CreateUser() {
  return (
    <Form action="post">
      <div class="container">
        <Input id="user_name" />
        <Button variant="outlined">OK</Button>  
      </div>
    </Form>
  );
}