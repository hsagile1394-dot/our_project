const roleWeights = {
"社長":3.0,
"取締役":2.5,
"部長":2.0,
"課長":1.6,
"マネージャー":1.4,
"リーダー":1.2,
"チーフ":1.1,
"スタッフ":1.0
};

const roleList = Object.keys(roleWeights);

const memberBody = document.getElementById("memberBody");
const addMemberBtn = document.getElementById("addMember");
const calculateBtn = document.getElementById("calculate");

addMemberBtn.addEventListener("click", addMember);
calculateBtn.addEventListener("click", calculate);

function addMember(){

const max = parseInt(document.getElementById("maxMembers").value);

if(memberBody.children.length >= max){
alert("最大メンバー数に達しました");
return;
}

const tr = document.createElement("tr");

const nameTd = document.createElement("td");
const roleTd = document.createElement("td");
const payTd = document.createElement("td");

const nameInput = document.createElement("input");
nameInput.placeholder="名前";

const roleSelect = document.createElement("select");

roleList.forEach(role=>{
const opt=document.createElement("option");
opt.value=role;
opt.textContent=role;
roleSelect.appendChild(opt);
});

nameTd.appendChild(nameInput);
roleTd.appendChild(roleSelect);
payTd.textContent="-";

tr.appendChild(nameTd);
tr.appendChild(roleTd);
tr.appendChild(payTd);

memberBody.appendChild(tr);
}

function calculate(){

const total = parseInt(document.getElementById("totalAmount").value);
const roundUnit = parseInt(document.getElementById("roundUnit").value);

if(!total){
alert("合計金額を入力してください");
return;
}

let members = [];

[...memberBody.children].forEach(row=>{
const name=row.children[0].querySelector("input").value;
const role=row.children[1].querySelector("select").value;

members.push({
name:name||"未入力",
role:role,
weight:roleWeights[role]
});
});

const totalWeight = members.reduce((sum,m)=>sum+m.weight,0);

let rawPayments = members.map(m=>{
return total*(m.weight/totalWeight);
});

let roundedPayments = rawPayments.map(p=>{
return Math.round(p/roundUnit)*roundUnit;
});

const sumRounded = roundedPayments.reduce((a,b)=>a+b,0);

const remainder = total - sumRounded;

members.forEach((m,i)=>{
memberBody.children[i].children[2].textContent =
roundedPayments[i].toLocaleString()+"円";
});

document.getElementById("result").innerHTML =
"合計支払い: "+sumRounded.toLocaleString()+"円<br>" +
"本来合計: "+total.toLocaleString()+"円<br>" +
"余り: "+remainder.toLocaleString()+"円";
}

// 初期メンバー
addMember();
addMember();
addMember();