<?php
    /**
     * Email contact form.
    */
    $to = "gone404@gmail.com";
    $from = $_REQUEST['email_address'];
    $from_name = strip_tags($_REQUEST['from_name']);
    $subject = "Contact: ".$_REQUEST['reason'];
    $message = "Contact request from hyszczak.net\r\n";
    $message .= "----------------------------------------------\r\n";
    $message .= strip_tags($_REQUEST['message']);
    $headers = "From: Majordomo <postmaster@camperkings.com> \r\n".
               "Reply-To: $from_name <$from> \r\n".
               "X-Mailer: PHP/".phpversion();

    //print "to:$to | from:$from | name:$from_name | subject:$subject | message:$message | headers:$headers";

    //print "REFERER:".$_SERVER['HTTP_REFERER'];

    if(mail($to, $subject, $message, $headers)) {
      print "SUCCESS";
    } else {
      print "FAILURE";
    }
?>


