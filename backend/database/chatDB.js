// chatDB.js (FINAL UPDATED VERSION)
const db = require("./db");

/**
 * Detects whether the assignmentId is a temporary mock ID.
 * These are used before real DB entries exist.
 */
const isMockId = (assignmentId) =>
    typeof assignmentId === "string" && assignmentId.startsWith("MOCK_CHAT_ROOM_");

/**
 * Saves a new message into the database, unless it’s a mock assignment ID.
 * @param {number|string} assignmentId
 * @param {number} senderId
 * @param {string} messageContent
 * @returns {Promise<{ message_id: number, assignment_id: string|number, sender_id: number, message: string, created_at: string }>}
 */
exports.saveMessage = async (assignmentId, senderId, messageContent) => {
    try {
        // 🧩 Skip saving if this is a mock chat room (temporary testing)
        if (isMockId(assignmentId)) {
            console.warn(`[DB SKIP] Mock assignment detected → message NOT saved. ID: ${assignmentId}`);
            return {
                message_id: Date.now(),
                assignment_id: assignmentId,
                sender_id: senderId,
                message: messageContent,
                created_at: new Date().toISOString(),
            };
        }

        // 🧩 Insert message into the real DB
        const insertSql = `
            INSERT INTO chat_messages (assignment_id, sender_id, message)
            VALUES (?, ?, ?)
        `;
        const result = await db(insertSql, [assignmentId, senderId, messageContent]);

        const messageId = result.insertId;

        // 🧩 Fetch exact created_at timestamp from DB (ensures consistent timezone)
        const fetchSql = `SELECT created_at FROM chat_messages WHERE message_id = ?`;
        const [timeRow] = await db(fetchSql, [messageId]);

        return {
            message_id: messageId,
            assignment_id: assignmentId,
            sender_id: senderId,
            message: messageContent,
            created_at: timeRow?.created_at || new Date().toISOString(),
        };
    } catch (error) {
        console.error(`❌ DB ERROR (saveMessage): ${error.message}`);
        throw error;
    }
};

/**
 * Fetches complete message history for a specific assignment ID.
 * @param {number|string} assignmentId
 * @returns {Promise<Array<{ message_id, sender_id, message, created_at }>>}
 */
exports.getChatHistory = async (assignmentId) => {
    try {
        // 🧩 Skip DB lookup for mock assignment IDs
        if (isMockId(assignmentId)) {
            console.warn(`[DB SKIP] Returning empty history for mock assignment ID: ${assignmentId}`);
            return [];
        }

        const sql = `
            SELECT message_id, sender_id, message, created_at
            FROM chat_messages
            WHERE assignment_id = ?
            ORDER BY created_at ASC
        `;
        const rows = await db(sql, [assignmentId]);

        return rows || [];
    } catch (error) {
        console.error(`❌ DB ERROR (getChatHistory): ${error.message}`);
        return [];
    }
};
