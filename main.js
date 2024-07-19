const registerEmail = document.querySelector(".register-email");
const registerPassword = document.querySelector(".register-password");
const registerBtn = document.querySelector(".register-btn");

const loginEmail = document.querySelector(".login-email");
const loginPassword = document.querySelector(".login-password");
const loginBtn = document.querySelector(".login-btn");

const toggleLoginBtn = document.querySelector(".toggle-login");
const toggleRegisterBtn = document.querySelector(".toggle-register");

const loginForm = document.querySelector(".login-form");
const registerForm = document.querySelector(".register-form");

const formsContainer = document.querySelector(".forms");
const chatsListContainer = document.querySelector(".chats-list");
const chatContainer = document.querySelector(".chat-container");

const loginInvalidMessage = document.querySelector(".login-invalid-message");
const loginInvalidMessageText = loginInvalidMessage.textContent
const registerInvalidMessage = document.querySelector(".register-invalid-message");
const registerInvalidMessageText = registerInvalidMessage.textContent

const chatBackBtn = document.querySelector(".chat-back-btn");
const openChatBtn = document.querySelector(".chats-list-item");

const messageInput = document.querySelector(".message-input");
const messageSendBtn = document.querySelector(".message-send");
const messagesList = document.querySelector(".messages-list");

const SERVER_URL = "http://127.0.0.1:3030";
const SERVER_IP = "127.0.0.1:3030";


const MY_USER_ID = 888;


async function userRegister(e) {
    e.preventDefault();

    const userEmail = registerEmail.value;
    const userPassword = registerPassword.value;

    const res = await fetch(SERVER_URL + "/auth/auth/register", {
        method: "POST",
        body: JSON.stringify({
            "email": userEmail,
            "password": userPassword,
        }),
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });

    const data = await res.json();
    if (!res.ok) {
        if (res.status == 422) {
            registerInvalidMessage.textContent = "Check your inputs";
        }
        else {
            registerInvalidMessage.textContent = registerInvalidMessageText;
        }
        registerInvalidMessage.classList.remove("hide");
    }
    return data;
}

async function userLogin(e){
    e.preventDefault();

    const userEmail = loginEmail.value;
    const userPassword = loginPassword.value;

    const res = await fetch(SERVER_URL + "/auth/auth/jwt/login", {
        method: "POST",
        body: JSON.stringify(`grant_type=password&username=${userEmail}&password=${userPassword}&scope=&client_id=string&client_secret=string`),
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        } 
    });

    if (res.ok) {
        const data = await res.json();
        localStorage.setItem("token", data.access_token);
        formsContainer.classList.add("hide");
        return data;
    }
    else {
        console.log(res.status);
        console.log(JSON.stringify(res.json().details));
        if (res.status == 422) {
            loginInvalidMessage.textContent = "Check your inputs";
        }
        else {
            loginInvalidMessage.textContent = loginInvalidMessageText;
        }
        loginInvalidMessage.classList.remove("hide");
    }
}

function toggleForm(){
    loginForm.classList.toggle("hide");
    registerForm.classList.toggle("hide");
    loginInvalidMessage.classList.add("hide");
    loginInvalidMessage.textContent = loginInvalidMessageText;
    registerInvalidMessage.classList.add("hide");
    registerInvalidMessage.textContent = registerInvalidMessageText;
}

async function checkAuthMe() {
    // e.preventDefault();

    const res = await fetch(SERVER_URL + "/auth/users/me", {
        method: "GET", 
        headers: {
            "Autorization": `Bearer ${localStorage.getItem("token")}`,
        }
    });

    const data = await res.json();
    if (res.status === 401) {
        chatsListContainer.classList.add("hide");
        chatContainer.classList.add("hide");

        formsContainer.classList.remove("hide");
        registerForm.classList.remove("hide");

        localStorage.removeItem("token");
    }

    console.log(res);
}

function goToChatsList(){
    chatContainer.classList.add("hide");
    chatsListContainer.classList.remove("hide");
}

function goToChat() {
    const userID = +prompt("Enter person id: ");

    chatContainer.classList.remove("hide");
    chatsListContainer.classList.add("hide");

    const ws = new WebSocket(`ws://${SERVER_IP}/ws/${MY_USER_ID}`);

    ws.unopen = function(){
        console.log("open");

        messageSendBtn.addEventListener("click", function(){
            const messageText = messageInput.value;
            
            ws.send(`${userID}: ${messageText}`);
            const message = document.createElement("div");
            message.classList.add("message", "my-message");
            message.textContent = messageText;

            messagesList.append(message);
        });
    }

    ws.onmessage = function(data){
        const messageText = data.data.split(":")[1];

        const message = document.createElement("div");
        message.classList.add("message", "user-message");
        message.textContent = messageText;

        messagesList.append(message);
    }
    
    ws.onerror = function(e){
        console.log("error", e);
    }

    ws.onclose = function() {
        console.log("close");
    }
}

registerBtn.addEventListener("click", userRegister);
loginBtn.addEventListener("click", userLogin);

toggleLoginBtn.addEventListener("click", toggleForm);
toggleRegisterBtn.addEventListener("click", toggleForm);

chatBackBtn.addEventListener("click", goToChatsList);
openChatBtn.addEventListener("click", goToChat);

async function init(){
    const token = localStorage.getItem("token");
    if (token) {
        formsContainer.classList.add("hide");
        chatsListContainer.classList.remove("hide");
    }

    checkAuthMe();

    loginForm.classList.add("hide");
}

init();
