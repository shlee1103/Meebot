export const CONFERENCE_STATUS = {
  CONFERENCE_WAITING: "발표회 시작 전",
  PRESENTATION_READY: "발표 시작 전",
  PRESENTATION_ACTIVE: "발표 중",
  PRESENTATION_COMPLETED: "발표 끝",
  QNA_READY: "질의응답 전",
  QNA_ACTIVE: "질의응답 중",
  QNA_COMPLETED: "질의응답 끝",
  FINAL_PRESENTATION_COMPLETED: "마지막 발표 끝",
  CONFERENCE_ENDED: "발표회 종료",
} as const;

export const FIXED_MENTS = {
  PRESENTATION_END: "발표가 종료되었습니다. 발표 요약은 채팅창에 표시될 예정입니다.",
  QNA_START: "질문이 있으신분들은 손들기 버튼을 통해 질문해 주시길 바랍니다.",
  QNA_END: (currnentPresenter: string, nextPresenter: string) => `이상으로  ${currnentPresenter}님의 발표를 마치겠습니다. 다음 발표는 ${nextPresenter}님의 차례입니다. 화면 공유 해주시길 바랍니다.`,
  FINAL_PRESENTATION_COMPLETED: (currnentPresenter: string) => `이상으로 ${currnentPresenter}님의 발표를 마치겠습니다. `,
  CONFERENCE_ENDED: "발표회가 종료되었습니다. 전체 발표 요약본은 PDF 및 Notion으로 제공 될 예정입니다..",
} as const;
