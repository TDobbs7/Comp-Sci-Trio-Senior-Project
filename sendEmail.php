<?php
if(isset($_POST['submit']))
{
    $message=
        'Full Name:	'.$_POST['fullname'].'<br />
        Subject:	'.$_POST['subject'].'<br />
        Email:	'.$_POST['emailid'].'<br />
        Comments:	'.$_POST['comments'].' ';

    require "PHPMailer-master/class.phpmailer.php"; //include phpmailer class

    // Instantiate Class
    $mail = new PHPMailer();

    // Set up SMTP
    $mail->IsSMTP();                // Sets up a SMTP connection
    $mail->SMTPAuth = true;         // Connection with the SMTP does require authorization
    $mail->SMTPSecure = "ssl";      // Connect using a TLS connection
    $mail->Host = "smtp.gmail.com";  //Gmail SMTP server address
    $mail->Port = 465;  //Gmail SMTP port
    $mail->Encoding = '7bit';

    // Authentication
    $mail->Username   = "brsimmon@aggies.ncat.edu"; // Your full Gmail address
    $mail->Password   = "compscitrio"; // Your Gmail password

    // Compose
    $mail->SetFrom($_POST['emailid'], $_POST['fullname']);
    $mail->AddReplyTo($_POST['emailid'], $_POST['fullname']);
    $mail->Subject = "New Contact Form Enquiry";      // Subject (which isn't required)
    $mail->MsgHTML($message);

    // Send To
    $mail->AddAddress("brsimmon@aggies.ncat.edu", "Brittany Simmons"); // Where to send it - Recipient
    $result = $mail->Send();		// Send!
    $message = $result ? '<div class="alert alert-success" role="alert"><strong>Success!</strong>Message Sent Successfully!</div>' : '<div class="alert alert-danger" role="alert"><strong>Error!</strong>There was a problem delivering the message.</div>';
    unset($mail);
}
	/*if (isset($_POST["submit"])) {
        $name = $_POST['name'];
        $email = $_POST['email'];
        $message = $_POST['message'];
        $human = intval($_POST['human']);
        $from = 'Demo Contact Form';
        $to = 'example@bootstrapbay.com';
        $subject = 'Message from Contact Demo ';

        $body = "From: $name\n E-Mail: $email\n Message:\n $message";

        // Check if name has been entered
        if (!$_POST['name']) {
            $errName = 'Please enter your name';
        }

        // Check if email has been entered and is valid
        if (!$_POST['email'] || !filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)) {
            $errEmail = 'Please enter a valid email address';
        }

        //Check if message has been entered
        if (!$_POST['message']) {
            $errMessage = 'Please enter your message';
        }
        //Check if simple anti-bot test is correct
        if ($human !== 5) {
            $errHuman = 'Your anti-spam is incorrect';
        }

// If there are no errors, send the email
        if (!$errName && !$errEmail && !$errMessage && !$errHuman) {
            if (mail ($to, $subject, $body, $from)) {
                $result='<div class="alert alert-success">Thank You! I will be in touch</div>';
            } else {
                $result='<div class="alert alert-danger">Sorry there was an error sending your message. Please try again later</div>';
            }
        }
    }*/

/* if(isset($_POST["submit"])){

        // Checking For Blank Fields..
        if($_POST["vname"]==""||$_POST["vemail"]==""||$_POST["vsubject"]==""||$_POST["vmessage"]==""){
            echo "Fill All Fields..";
        } else {
            // Check if the "Sender's Email" input field is filled out
            $email = $_POST['vemail'];
            // Sanitize E-mail Address
            $email = filter_var($email, FILTER_SANITIZE_EMAIL);
            // Validate E-mail Address
            $email = filter_var($email, FILTER_VALIDATE_EMAIL);

            if (!$email){
                echo "Invalid Sender's Email";
            } else {
                $subject = $_POST['vsubject'];
                $message = $_POST['vmessage'];
                $headers = 'From:'. $email . "\r\n"; // Sender's Email
                $headers .= 'Cc:'. $email . "\r\n"; // Carbon copy to Sender

                // Message lines should not exceed 70 characters (PHP rule), so wrap it
                $message = wordwrap($message, 70);

                // Send Mail By PHP Mail Function
                mail("brsimmon@aggies.ncat.edu", $subject, $message, $headers);
                echo "Your mail has been sent successfuly ! Thank you for your feedback";
            }

        }
    }*/
?>