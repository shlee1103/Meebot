import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DropResult } from "react-beautiful-dnd";
import { RootState, setPresentationTime, setQnATime, updateSpeakersOrder } from "../../stores/store";
import { ParticipantInfo } from "./useOpenVidu";

export const usePresentationSetting = () => {
  const { presentationTime, qnaTime, presentersOrder } = useSelector((state: RootState) => state.presentation);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSpeakers, setSelectedSpeakers] = useState<ParticipantInfo[]>([]);

  const dispatch = useDispatch();

  const handleSpeakerSelect = (participant: ParticipantInfo) => {
    if (!selectedSpeakers.includes(participant)) {
      const newSelectedSpeakers = [...selectedSpeakers, participant];
      setSelectedSpeakers(newSelectedSpeakers);
      dispatch(updateSpeakersOrder(newSelectedSpeakers));
    }
  };

  const handleSpeakerRemove = (participant: string) => {
    const filteredSpeakers = selectedSpeakers.filter((speaker) => speaker.name !== participant);
    setSelectedSpeakers(filteredSpeakers);
    dispatch(updateSpeakersOrder(filteredSpeakers));
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(presentersOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    dispatch(updateSpeakersOrder(items));
  };

  const randomizeSpeakersOrder = () => {
    const newOrder = [...presentersOrder];
    for (let i = newOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newOrder[i], newOrder[j]] = [newOrder[j], newOrder[i]];
    }
    dispatch(updateSpeakersOrder(newOrder));
  };

  const cancelModal = () => {
    setSelectedSpeakers([]);
    dispatch(updateSpeakersOrder([]));
    setIsModalOpen(false);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return {
    isModalOpen,
    presentationTime,
    setPresentationTime: (time: number) => dispatch(setPresentationTime(time)),
    qnaTime,
    setQnATime: (time: number) => dispatch(setQnATime(time)),
    selectedSpeakers,
    presentersOrder,
    handleSpeakerSelect,
    handleSpeakerRemove,
    handleDragEnd,
    randomizeSpeakersOrder,
    cancelModal,
    toggleModal,
  };
};
