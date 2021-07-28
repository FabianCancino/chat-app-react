import { put, takeEvery } from "redux-saga/effects";
import { messagesLoaded } from "../actions";
import Axios from "axios";

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

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

export const conversationsSaga = function* () {
  yield delay(1000);
  const conversations = yield data();
  console.log({
    conversation: conversations[0].id,
    messages: conversations[0].messages,
  });
  yield put(
    messagesLoaded(conversations[0].id, conversations[0].messages, false, null)
  );

  yield put({
    type: "CONVERSATIONS_LOADED",
    payload: {
      conversations,
      selectedConversation: conversations[0],
    },
  });
};

export function* watchGetConversationsAsync() {
  yield takeEvery("CONVERSATIONS_REQUESTED", conversationsSaga);
}
