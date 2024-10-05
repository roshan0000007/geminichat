document.addEventListener("DOMContentLoaded", () => {
    const typingform = document.querySelector(".typing-form");
    const chatlist = document.querySelector(".chat-list");

    const API_KEY = "AIzaSyA6o-OpqfZn1BUvEemV80_nScML9cORI7Q";  
    const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${API_KEY}`;

    if (!typingform) {
        console.error("Form not found");
        return;
    }

    const createmessageelement = (content, ...classes) => {
        const div = document.createElement("div");
        div.classList.add("message", ...classes);
        div.innerHTML = content;
        return div;
    };

    const showtypingeffect = (text, textelement) => {
        const words = text.split(' ');
        let currentwordindex = 0;

        const typinginterval = setInterval(() => {
            textelement.innerText += (currentwordindex === 0 ? '' : ' ') + words[currentwordindex++];
            if (currentwordindex === words.length) {
                clearInterval(typinginterval);
            }
        }, 75);
    };

    const generateAPIresponse = async (usermessage, incomingmessagediv) => {
        const textelement = incomingmessagediv.querySelector(".text");

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",
                            parts: [{ text: usermessage }]
                        }
                    ]
                })
            });

            const data = await response.json();
            const apiresponse = data?.candidates[0]?.content?.parts[0]?.text || "No response from API";

            showtypingeffect(apiresponse, textelement);
        } catch (error) {
            console.log(error);
            textelement.innerText = "Error fetching API response.";
        } finally {
            incomingmessagediv.classList.remove("loading");
        }
    };

    const showloadinganimation = (usermessage) => {
        const html = `
            <div class="message-content">
                <img src="gemini.png" alt="gemini image" class="avatar">
                <p class="text"></p>
                <div class="loading-indicator">
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                    <div class="loading-bar"></div>
                </div>
            </div>
            <span onclick="copymessage(this)" class="icon material-symbols-rounded">
                content_copy
            </span>
        `;

        const incomingmessagediv = createmessageelement(html, "incoming", "loading");
        chatlist.appendChild(incomingmessagediv);

        generateAPIresponse(usermessage, incomingmessagediv);
    };

    const copymessage = async (copyicon) => {
        const messagetext = copyicon.parentElement.querySelector(".text").innerText;
        try {
            await navigator.clipboard.writeText(messagetext);
            copyicon.innerText = "done"; // Show tick icon
            setTimeout(() => {
                copyicon.innerText = "content_copy"; // Revert icon after 1 second
            }, 1000);
        } catch (err) {
            console.error("Failed to copy: ", err);
        }
    };

    const handleoutgoingchat = () => {
        const usermessage = typingform.querySelector(".typing-input").value.trim();
        if (!usermessage) return;

        const html = `
            <div class="message-content">
                <img src="404.png" alt="user image" class="avatar">
                <p class="text"></p>
                <span onclick="copymessage(this)" class="icon material-symbols-rounded">
                    content_copy
                </span>
            </div>
        `;

        const outgoingmessagediv = createmessageelement(html, "outgoing");
        outgoingmessagediv.querySelector(".text").innerText = usermessage;
        chatlist.appendChild(outgoingmessagediv);

        typingform.reset(); // Clear input field
        setTimeout(() => showloadinganimation(usermessage), 500); // Pass usermessage to showloadinganimation
    };

    typingform.addEventListener("submit", (e) => {
        e.preventDefault();
        handleoutgoingchat();
    });
});
