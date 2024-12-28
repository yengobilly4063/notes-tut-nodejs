import { Sequelize, Model, DataTypes } from 'sequelize';
import { connectDB as connectSequlz, close as closeSequlz } from './sequelize.js';
import { default as EventEmitter } from 'events';
import { default as DBG } from 'debug';
import { MessagesEmitEvents } from './event.list.js';
const debug = DBG('notes:model-messages');
const error = DBG('notes:error-messages');

class MessagesEmitter extends EventEmitter {}

export const emitter = new MessagesEmitter();

let sequelize;

export class SQMessage extends Model {}

async function connectDB() {
    if (sequelize) return;
    sequelize = await connectSequlz();

    SQMessage.init(
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            from: DataTypes.STRING,
            namespace: DataTypes.STRING,
            room: DataTypes.STRING,
            message: DataTypes.STRING(1024),
            timestamp: DataTypes.DATE,
        },
        {
            hooks: {
                afterCreate: (message, options) => {
                    const toEmit = sanitizeMessage(message);
                    emitter.emit(MessagesEmitEvents.created, toEmit);
                },
                afterDestroy: (message, option) => {
                    const { id, namespace, room } = message;
                    emitter.emit(MessagesEmitEvents.destroyed, {
                        id,
                        namespace,
                        room,
                    });
                },
            },
            sequelize,
            modelName: 'messages',
        }
    );
    await SQMessage.sync();
}

function sanitizeMessage(msg) {
    const { id, from, namespace, room, message, timestamp } = msg;
    return { id, from, namespace, room, message, timestamp };
}

export async function postMessage({ from, namespace, room, message }) {
    await connectDB();
    const newMessage = await SQMessage.create({
        from,
        namespace,
        room,
        message,
        timestamp: new Date(),
    });
}

export async function destroyMessage(id) {
    await connectDB();
    const msg = await SQMessage.findOne({ where: { id } });
    if (msg) {
        msg.destroy();
    }
}

export async function recentMessages(namespace, room) {
    await connectDB();
    const messages = await SQMessage.findAll({
        where: { namespace, room },
        order: [['timestamp', 'DESC']],
        limit: 20,
    });

    const msgs = messages.map((message) => sanitizeMessage(message));

    return msgs && msgs.length >= 0 ? msgs : undefined;
}
