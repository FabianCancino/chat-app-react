import { put, takeLatest } from "redux-saga/effects";
import Axios from "axios";
import { messagesLoaded } from "../actions";

const data = async () => {
  const response = await Axios({
    url: "http://localhost:8080/api/chats/",
    method: "GET",
  });
  const res = response.data.reduce((prev, current) => {
    const messages = current.messages.reduce((prevq, currentp) => {
      return [
        ...prevq,
        {
          imageUrl: null,
          imageAlt: null,
          messageText: currentp.message,
          createdAt: currentp.time,
          isMyMessage: currentp.isSendByAdmin,
        },
      ];
    }, []);
    return [
      ...prev,
      {
        id: current.id,
        title: current.contact.fullname,
        createdAt: current.messages[0].time,
        latestMessageText:
          current.messages[current.messages.length - 1].message,
        messages,
      },
    ];
  }, []);
  return res;
};

const messageDetails = {};

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const messagesSaga = function* (action) {
  const { conversationId, numberOfMessages, lastMessageId } = action.payload;
  const dat = yield data();
  const messages = dat[conversationId === 0 ? 0 : conversationId - 1].messages;
  console.log({ dat, messages, conversationId });
  const startIndex = lastMessageId
    ? messages.findIndex((message) => message.id === lastMessageId) + 1
    : 0;
  const endIndex = startIndex + numberOfMessages;
  const pageGroup = messages.slice(startIndex, endIndex);
  const newLastMessageId =
    pageGroup.length > 0 ? pageGroup[pageGroup.length - 1].id : null;
  const hasMoreMessages = newLastMessageId && endIndex < messages.length - 1;

  yield delay(1000);

  yield put(
    messagesLoaded(conversationId, pageGroup, hasMoreMessages, newLastMessageId)
  );

  if (hasMoreMessages) {
    yield delay(1000);
    yield put({
      type: "MESSAGES_REQUESTED",
      payload: {
        conversationId,
        numberOfMessages,
        lastMessageId: newLastMessageId,
      },
    });
  }
};

export const watchGetMessagesAsync = function* () {
  yield takeLatest("MESSAGES_REQUESTED", messagesSaga);
};
