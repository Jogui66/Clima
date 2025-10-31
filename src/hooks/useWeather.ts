import axios from "axios"
import { z } from "zod"
// import { object, string, number, parse, type InferOutput } from "valibot"
import type { searchType } from "../types"
import { useMemo, useState } from "react"

// TYPE GUARD 0 ASSERTION
// function isWeatherResponse(weather: unknown) : weather is Weather {
//     return (
//         Boolean(weather) &&
//         typeof weather === 'object' &&
//         typeof (weather as Weather).name === 'string' &&
//         typeof (weather as Weather).main.temp === 'number' &&
//         typeof (weather as Weather).main.temp_max === 'number' &&
//         typeof (weather as Weather).main.temp_min === 'number'
//     )
// }

// zod
const Weather = z.object({
    name: z.string(),
    main: z.object({
        temp: z.number(),
        temp_max: z.number(),
        temp_min: z.number()
    })
})
export type Weather = z.infer<typeof Weather>

// Valibot
// const WeatherSchema = object({
//     name: string(),
//     main: object({
//         temp: number(),
//         temp_max: number(),
//         temp_min: number()
//     })
// })
// type Weather = InferOutput<typeof WeatherSchema>

const initialState = {
        name: '',
        main: {
            temp: 0,
            temp_max: 0,
            temp_min: 0
        }
    }

export default function useWeather() {

    const [weather, setWeather] = useState<Weather>(initialState)
    const [loading, setLoading] = useState(false)
    const [notFound, setNotFound] = useState(false)

    const fetchWeather = async (search : searchType) => {

        const appId = import.meta.env.VITE_API_KEY

        setLoading(true)
        setWeather(initialState)
        
        try {
            const geoURL = `https://api.openweathermap.org/geo/1.0/direct?q=${search.city},${search.country}&appid=${appId}`

            const {data} = await axios(geoURL)

            // Comprobar si existe
            if(!data[0]) {
                setNotFound(true)
                return
            }

            const lat = data[0].lat
            const lon = data[0].lon

            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${appId}`

            // Castear el Type
            // const {data: weatherResults} = await axios<Weather>(weatherUrl)
            // console.log(weatherResults.main.temp)
            // console.log(weatherResults.name)
            
            // Type Guards
            // const {data: weatherResults} = await axios(weatherUrl)
            // const result = isWeatherResponse(weatherResults)
            // if(result) {
            //     console.log(weatherResults.name)
            // } else {
            //     console.log('respuesta mal formada')
            // }
            
            // Zod
            const {data: weatherResults} = await axios(weatherUrl)
            const result = Weather.safeParse(weatherResults)
            if(result.success) {
                setWeather(result.data)
            } else {
                console.log('respuesta mal formada')
            }

            // Valibot
            // const {data: weatherResults} = await axios(weatherUrl)
            // const result = parse(WeatherSchema, weatherResults)
            // if(result) {
            //     console.log(result.name)
            // } else {
            //     console.log('respuesta mal formada')
            // }
            
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const hasWeatherData = useMemo(() => weather.name, [weather])

    return {
        weather,
        loading,
        notFound,
        fetchWeather,
        hasWeatherData
    }
}