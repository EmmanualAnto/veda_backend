import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Brevo (Sendinblue) transporter
const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false, // TLS
    auth: {
        user: process.env.BREVO_EMAIL,       // Your verified Brevo email
        pass: process.env.BREVO_SMTP_KEY,    // The SMTP key you generated
    },
});

// Contact form endpoint
app.post("/send", async (req, res) => {
    const { name, email, phone, message } = req.body;

    const htmlContent = `
    <div style="font-family: Arial, sans-serif; color: #333; line-height:1.5;">
        <h2 style="color:#0035FF;">New Contact Form Submission</h2>

        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>

        <p><strong>Message:</strong></p>
        <p style="background:#f4f4f4; padding:10px; border-radius:5px;">${message}</p>

        <p>
            <a href="mailto:${email}" style="
                display:inline-block;
                padding:10px 20px;
                background:#0035FF;
                color:white;
                text-decoration:none;
                border-radius:5px;
                font-weight:bold;
            ">Reply</a>
        </p>

        <hr>
        <p style="font-size:12px; color:#888;">Sent via Veda Contact Form</p>
    </div>
    `;

    const mailOptions = {
        from: process.env.BREVO_EMAIL,   // verified sender
        to: process.env.BREVO_EMAIL,     // where you want to receive
        subject: `New message from ${name}`,
        html: htmlContent,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: "Message sent successfully!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Error sending message" });
    }
});

app.get("/", (req, res) => res.send("Server is running"));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
