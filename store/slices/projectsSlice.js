import { createSlice } from "@reduxjs/toolkit";
import { projects as initialProjects } from "../../data/projectsData";

const projectsSlice = createSlice({
    name: "projects",
    initialState: {
        items: initialProjects,
    },
    reducers: {
        addProjectFollowUp: (state, action) => {
            const { projectId, followUp } = action.payload;
            const project = state.items.find((item) => item.id === projectId);

            if (project) {
                project.followUps.unshift(followUp);
                project.status = "Follow up";
                project.statusType = "followUp";
                project.nextAction = followUp.note;
                project.lastContact = "Today";
            }
        },
        addProjectMeeting: (state, action) => {
            const { projectId, meeting } = action.payload;
            const project = state.items.find((item) => item.id === projectId);

            if (project) {
                project.meetings.unshift(meeting);
                project.status = "Meeting Set";
                project.statusType = "meeting";
                project.nextAction = `Meet at ${meeting.location} for ${meeting.type.toLowerCase()}`;
                project.lastContact = "Today";
            }
        },
    },
});

export const { addProjectFollowUp, addProjectMeeting } = projectsSlice.actions;
export const selectProjects = (state) => state.projects.items;
export const selectProjectById = (state, projectId) => state.projects.items.find((project) => project.id === projectId);
export const selectAllProjectFollowUps = (state) => state.projects.items.flatMap((project) => project.followUps);
export const selectAllProjectMeetings = (state) => state.projects.items.flatMap((project) => project.meetings);
export default projectsSlice.reducer;
