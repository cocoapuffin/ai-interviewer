"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { ObjectId } from "mongodb";
import { z } from "zod"; // Add this import

// Import only what we use
import { collection } from "@/app/MongoDB/client";
// Remove this import since we'll define it locally
// import { feedbackSchema } from "@/constants";

// Define the feedbackSchema in this file
const feedbackSchema = z.object({
    totalScore: z.number(),
    categoryScores: z.record(z.string(), z.number()),
    strengths: z.array(z.string()),
    areasForImprovement: z.array(z.string()),
    finalAssessment: z.string(),
});

// Define proper interfaces
interface CreateFeedbackParams {
    interviewId: string;
    userId: string;
    transcript: { role: string; content: string }[];
    feedbackId?: string;
}

interface Interview {
    _id?: ObjectId;
    id?: string;
    userId: string;
    role: string;
    type: string;
    techstack: string[];
    level: string;
    questions: string[];
    finalized: boolean;
    createdAt: string;
}

interface Feedback {
    _id?: ObjectId;
    id?: string;
    interviewId: string;
    userId: string;
    totalScore: number;
    categoryScores: Record<string, number>;
    strengths: string[];
    areasForImprovement: string[];
    finalAssessment: string;
    createdAt: string;
}

interface GetFeedbackByInterviewIdParams {
    interviewId: string;
    userId: string;
}

interface GetLatestInterviewsParams {
    userId: string;
    limit?: number;
}

export async function createFeedback(params: CreateFeedbackParams) {
    const { interviewId, userId, transcript, feedbackId } = params;

    try {
        const formattedTranscript = transcript
            .map(
                (sentence: { role: string; content: string }) =>
                    `- ${sentence.role}: ${sentence.content}\n`
            )
            .join("");

        // Define type for the generated object
        interface FeedbackResult {
            totalScore: number;
            categoryScores: Record<string, number>;
            strengths: string[];
            areasForImprovement: string[];
            finalAssessment: string;
        }

        const { object } = await generateObject<FeedbackResult>({
            model: google("gemini-2.0-flash-001", {
                structuredOutputs: false,
            }),
            schema: feedbackSchema,
            prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
        `,
            system: "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
        });

        const feedback = {
            interviewId: interviewId,
            userId: userId,
            totalScore: object.totalScore,
            categoryScores: object.categoryScores,
            strengths: object.strengths,
            areasForImprovement: object.areasForImprovement,
            finalAssessment: object.finalAssessment,
            createdAt: new Date().toISOString(),
        };

        const feedbackCollection = await collection("feedback");
        let result;

        if (feedbackId) {
            // Update existing document
            result = await feedbackCollection.updateOne(
                { _id: new ObjectId(feedbackId) },
                { $set: feedback }
            );
            return { success: true, feedbackId: feedbackId };
        } else {
            // Insert new document
            result = await feedbackCollection.insertOne(feedback);
            return { success: true, feedbackId: result.insertedId.toString() };
        }
    } catch (error) {
        console.error("Error saving feedback:", error);
        return { success: false };
    }
}

// Rest of your code remains unchanged
export async function getInterviewById(id: string): Promise<Interview | null> {
    try {
        const interviewsCollection = await collection("interviews");
        const interview = await interviewsCollection.findOne({
            _id: new ObjectId(id),
        });

        if (!interview) return null;

        return {
            id: interview._id.toString(),
            ...interview,
        } as Interview;
    } catch (error) {
        console.error("Error getting interview:", error);
        return null;
    }
}

export async function getFeedbackByInterviewId(
    params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
    const { interviewId, userId } = params;

    try {
        const feedbackCollection = await collection("feedback");
        const feedback = await feedbackCollection.findOne({
            interviewId: interviewId,
            userId: userId,
        });

        if (!feedback) return null;

        return {
            id: feedback._id.toString(),
            ...feedback,
        } as Feedback;
    } catch (error) {
        console.error("Error getting feedback:", error);
        return null;
    }
}

export async function getLatestInterviews(
    params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
    const { userId, limit = 20 } = params;

    try {
        const interviewsCollection = await collection("interviews");
        const interviews = await interviewsCollection
            .find({
                finalized: true,
                userId: { $ne: userId },
            })
            .sort({ createdAt: -1 })
            .limit(limit)
            .toArray();

        return interviews.map((interview) => ({
            id: interview._id.toString(),
            ...interview,
        })) as Interview[];
    } catch (error) {
        console.error("Error getting latest interviews:", error);
        return null;
    }
}

export async function getInterviewsByUserId(
    userId: string
): Promise<Interview[] | null> {
    try {
        const interviewsCollection = await collection("interviews");
        const interviews = await interviewsCollection
            .find({ userId: userId })
            .sort({ createdAt: -1 })
            .toArray();

        return interviews.map((interview) => ({
            id: interview._id.toString(),
            ...interview,
        })) as Interview[];
    } catch (error) {
        console.error("Error getting user interviews:", error);
        return null;
    }
}
