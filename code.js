import emailjs from "emailjs-com";

users.forEach((email) => {
  emailjs.send(
    "YOUR_SERVICE_ID",
    "YOUR_TEMPLATE_ID",
    {
      to_email: email,
      user_name: "Vigilant User"
    },
    "YOUR_PUBLIC_KEY"
  )
  .then(() => {
    console.log(`Email sent to ${email}`);
  })
  .catch((error) => {
    console.error(`Failed for ${email}`, error);
  });
});
