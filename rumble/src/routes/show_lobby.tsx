import Button from '@mui/material/Button';
import Input from '@mui/material/Input'
import { Form } from "react-router-dom";

export default function ShowLobby() {
  return (
    <div class="container">
      <Form action="post">
        <Input id="user_name" />
        <Button variant="outlined">OK</Button>  
      </Form>
    </div>
  );
}