// src/hooks/useEventDetail.ts

import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Event } from "../types/event";
import api from "../services/apiService";

const fetchEventById = async (id: string): Promise<Event> => {
	const { data } = await api.get(`/events/${id}`);
	return data;
};

const trackEventClick = (eventId: string): Promise<void> => {
	return api.post(`/events/${eventId}/track-click`);
};

export const useEventDetail = () => {
	const { id } = useParams<{ id: string }>();

	const {
		data: event,
		isLoading,
		isError,
	} = useQuery<Event, Error>({
		queryKey: ["event", id],
		queryFn: () => fetchEventById(id!),
		enabled: !!id,
	});

	const trackClickMutation = useMutation({
		mutationFn: trackEventClick,
		onError: (error) => {
			console.error("Gagal melacak klik:", error);
		},
	});

	const handleExternalLinkClick = () => {
		if (event?.externalUrl) {
			trackClickMutation.mutate(event.id.toString());
			window.open(event.externalUrl, "_blank", "noopener,noreferrer");
		}
	};

	return {
		event,
		isLoading,
		isError,
		handleExternalLinkClick,
	};
};
