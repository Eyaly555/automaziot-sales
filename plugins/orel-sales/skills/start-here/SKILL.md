---
name: start-here
description: Greets the salesperson in Hebrew, checks the connection to the CRM, and lists what he can ask for. Use it on his first message, when he says "שלום", "התחלה", "מה אפשר לעשות", "מה אתה יודע", "לא עובד", "בדוק חיבור", or whenever he seems unsure what this tool does.
---

# start-here

Speak Hebrew, every word of it (no English phrases mixed in). He is a salesperson, not a developer: no technical words, no tool names, no paths. Short sentences.

1. Call the `whoami` tool.
   - If it answers, greet him by first name and say how many clients are assigned to him.
   - If it fails with an authorization error, or the tools are missing: say the access code was not accepted, and walk him through it: in the Code tab, **+** next to the message box, **Plugins**, **Manage plugins**, find «כלי המכירות של אוטומציות AI», configure, paste the access code again. He makes a fresh code himself in the sales app: «ההתחלה שלי» ← the Claude step ← «הצגת שורת ההתקנה וקוד הגישה». Then a new chat.
   - Any other failure: say the system did not answer, try once more, then tell him to send Eyal a screenshot.
2. **Updates.** The plugin turns on automatic updates by itself when a session starts (it needs Node.js, which the install guide covers). Read `~/.claude/settings.json`: if `extraKnownMarketplaces` has an `automaziot-sales` entry with `"autoUpdate": true`, say nothing about it. If the entry exists without it, tell him in one line that Node.js seems to be missing, so the tools will not update by themselves until he installs it (nodejs.org, the LTS button) and reopens Claude.
3. Show what he can say, in his words, as a short list:
   - «מה יש לי היום» / «מה קרה עם <לקוח>» / «מה דיברנו עם <לקוח>» / «מה המשימות שלי»
   - «תכין אותי לשיחה עם <לקוח>»
   - «תכין הצעה ל<לקוח>» / «תשנה בהצעה של <לקוח> את ...» / «תשלח את ההצעה של <לקוח> לאישור של אייל»
   - «תבנה דמו ל<לקוח>» (מספיק שם, חברה או מספר טלפון)
   - «תבנה ל<לקוח> סוכן וואטסאפ» / «סוכן שעונה לטלפון» / «תחבר את המספר שלו לסוכן»
   - «מה אנחנו מציעים לעסק כזה» / «אין לו מערכת, מה האפשרויות» / «איך פתרנו דבר כזה»
   - «תכתוב ל<לקוח> הודעה» (הצעה, פולו-אפ, סגירה, קביעת פגישה)
   - «תעבור איתי על השיחה עם <לקוח>» / «במה להשתפר» / «בוא נתרגל שיחה» / «מבחן הסמכה 1»
   - «אפשר לקבוע פגישה עם אייל ל<לקוח>?»
   - «מה היעדים שלי החודש» / «מה חדש ב-AI היום»
   - «תראה לי את המדריכים» / «איך עונים כשאומרים יקר»
   And one line: for things that should run by themselves (a reminder, the morning plan, market news) he has נדב on
   Discord, in the channel #orel-ai.
4. Say what stays with him: nothing goes to a client by itself. Every offer first goes to Eyal's approval; after that he sends it, and he tells me that he sent.

End after the list. Do not ask what he wants to do; the list already says it.
