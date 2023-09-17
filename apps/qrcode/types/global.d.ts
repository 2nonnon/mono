import { LocaleType } from "@/i18n-config"

export interface IParams {
    lang: LocaleType
    id?: string
}

export interface ISearchParams {
    [key: string]: string | string[] | undefined
}

export interface PageProps {
    params: IParams,
    searchParams?: ISearchParams,
}

declare global {
    declare interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
        SpeechGrammarList: any;
        webkitSpeechGrammarList: any;
        SpeechRecognitionEvent: any;
        webkitSpeechRecognitionEvent: any;
    }
}