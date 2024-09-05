const Database = require("better-sqlite3");

const db = new Database("./myapp.db", { verbose: console.log });

// 테이블 생성
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    why TEXT,
    medium TEXT
  );

  CREATE TABLE IF NOT EXISTS cycles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    date TEXT,
    activity TEXT,
    participants TEXT,
    reflection TEXT DEFAULT '',
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cycle_id INTEGER,
    user_id INTEGER,
    content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cycle_id) REFERENCES cycles (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
  );
`);

// 초기 데이터 삽입 (한 번만 실행)
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get().count;

if (userCount === 0) {
  const insertUser = db.prepare(
    "INSERT INTO users (username, password, why, medium) VALUES (?, ?, ?, ?)"
  );
  const insertCycle = db.prepare(
    "INSERT INTO cycles (user_id, date, activity, participants, reflection) VALUES (?, ?, ?, ?, ?)"
  );

  // 트랜잭션 시작
  const insertData = db.transaction(() => {
    insertUser.run(
      "아용구리",
      "1234",
      "알게 되면 사랑할 수 밖에 없는 나를 있는 그대로 솔직하게 만날 기회가 없다.",
      "클립"
    );
    insertUser.run(
      "안증명",
      "1234",
      "증명할 수 없는 존재가치를 증명하려고 애쓰는 사람들에게 존재는 주고 받는 사랑 속에 있다는 것을 알 수 있도록 돕는다.",
      "달리기"
    );
    insertUser.run(
      "신건우",
      "1234",
      "타인의 시선 속에 존재가치가 있다고 생각하는 사람들이 타인과의 관계 속에 존재가치가 있다는 것을 발견하도록 돕는다.",
      "사이클"
    );

    // insertCycle.run(user1.lastInsertRowid, "2023-05-01", "공원에서 30분 달리기", "안증명", "오늘은 날씨가 좋아서 기분 좋게 달렸다.");
    // insertCycle.run(user1.lastInsertRowid, "2023-05-03", "트랙에서 5km 달리기", "안증명,김철수", "친구와 함께 달리니 더 열심히 할 수 있었다.");
    // insertCycle.run(user2.lastInsertRowid, "2023-05-02", "수영장에서 자유형 1km", "신건우", "처음으로 1km를 쉬지 않고 완주했다.");
    // insertCycle.run(user2.lastInsertRowid, "2023-05-04", "바다에서 오픈워터 수영 30분", "신건우,박영희", "바다에서 수영하니 새로운 경험이었다.");
  });

  insertData();
  console.log("Initial data inserted");
} else {
  console.log("Data already exists, skipping insertion");
}

module.exports = db;
