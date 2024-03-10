import * as _sgMail from "@sendgrid/mail";
_sgMail.setApiKey(process.env.SENDGRID_API_KEY ?? "");

export const sgMail = _sgMail;
