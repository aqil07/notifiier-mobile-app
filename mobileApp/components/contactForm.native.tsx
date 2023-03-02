
import React, { useEffect, useReducer, useState } from 'react';
import type { PropsWithChildren } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    Button,
    useColorScheme,
    PermissionsAndroid,
    View,
    Alert,
    Image,
    Linking,
    AppState,
} from 'react-native';

// import 'react-native-geolocation-service' ;
import Geolocation from 'react-native-geolocation-service';

// const Geolocation = Geo
const requestOptions = {
    method: 'GET'
};
const apiKey = 'e5b25569f3e6441a9ae5b2b1d5e4351a';
const locationType = 'street';
const language = 'en';
// const format = 'json';
const limit = 1;

async function fetchData(url: string) {



    // console.log(searchURL)
    return await fetch(url, requestOptions).then((res) => {
        return res.json();
    })
}

export const NotifierForm = () => {

    const [response, setResponse]: [any, any] = useState({});
    // const [userNumber, setNumber] = useState('');
    const [getWatchId, setWatchId]: [any, any] = useState();
    // const [targetLocation, setTargetLocation] = useState('');

    // console.log(AppState.currentState);



    type locationResponse =
        {
            latitude: number, longitude: number
        }

    let intialVal: locationResponse = {
        latitude: 0, longitude: 0
    }

    const [userLocate, gs_etUserLocation] = useReducer(function (state: any, dispatch: { type: any, userlocate?: any, userTarget?: any, destination?: any, recipNumber?: string; }) {
        switch (dispatch.type) {
            case 'updateLocation': {
                return {
                    intialVal: dispatch.userlocate
                }
            }
            case 'setTarget': {
                return {
                    ...state, userTargetLocateAddr: dispatch.userTarget,
                    targetCoords: dispatch.destination
                }
            }
            case 'getNumber': {
                // console.log(dispatch.recipNumber);

                return {
                    ...state, userContactNum: dispatch.recipNumber
                }
            }
            default: { return { ...state } }

        }
    }, {
        intialVal, userTargetLocateAddr: '', targetCoords: {}, userContactNum: ''
    });

    //destructuring reducer response
    const { userContactNum } = userLocate
    console.log(userContactNum);

    const { targetCoords } = userLocate
    const { userTargetLocateAddr } = userLocate
    const { latitude, longitude } = userLocate.intialVal

    async function checkPermission() {
        const hasPermission = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );

        if (hasPermission) return true;

        const accessStatus = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );

        if (accessStatus === PermissionsAndroid.RESULTS.GRANTED) return true

        if (accessStatus === PermissionsAndroid.RESULTS.DENIED) {
            console.log('Permission Denied');
            Alert.alert('Permission required')

        } else if (accessStatus === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            console.log('Permission revoked');

        }

        return false;

    }


    async function watchUser() {

        setWatchId(Geolocation.watchPosition(
            async function success(d) {
                // console.log(d.coords.latitude);


                gs_etUserLocation({
                    type: 'updateLocation',
                    userlocate: d.coords
                })



                const searchURL = `https://api.geoapify.com/v1/geocode/reverse?lat=${d.coords.latitude}&lon=${d.coords.longitude}&type=${locationType}&lang=${language}&limit=${limit}&apiKey=${apiKey}`;

                await fetchData(searchURL).then((res) => {
                    if (res.hasOwnProperty('error')) {
                        // console.log('res',res);
                        throw new Error(`${res.statusCode}:${res.message}`)

                    }
                    // console.log(res);
                    setResponse(res.features[0])

                    return res

                }).catch((err) => {
                    console.log('e', err);
                    return err

                });





            }, function error(e) {
                console.log('error', e)
            }, {
            accuracy: {
                android: 'high'
            },
            distanceFilter: 100,
            enableHighAccuracy: true,
            interval: 1000,
            fastestInterval: 500,
            useSignificantChanges: true,
            showsBackgroundLocationIndicator: true
        }))
    };


    async function tracker() {
        if (latitude != 0 || longitude != 0) {
            if (latitude?.toFixed(3) == targetCoords?.lat?.toFixed(3) &&
                longitude?.toFixed(3) == targetCoords?.lon?.toFixed(3)) {
                // console.log('Here');

                return 'here'

            }

        }
    }

    //get location
    async function getLocation(): Promise<any> {

        const verifi = await checkPermission()
        // console.log(verifi);
        if (!verifi) return;

        if (verifi) {
            await watchUser()



        }

    }

    //send message to recipient
    function sendMessage() {
        const url = 'whatsapp://send?text=Hello Test&phone=27603531651';
        Linking.openURL(url).then((res) => {
            console.log(res);

        }).catch(() => {
            Alert.alert('Install whatsapp to send messages')
        })
    }

    useEffect(() => {

        const interval = setInterval(() => {
            getLocation()
        }, 36000)

        tracker().then((res) => {
            // console.log('r', longitude);
            if (res == 'here') {
                Alert.alert("Hooray", "You have arrived", [
                    {
                        text: 'OK',
                        style: 'default',
                        onPress: () => {
                            console.log('Sent');

                            // sendMessage()
                        }
                    }
                ])
            }

        })

        // AppState.addEventListener('change', (nextAppState) => {
        //     console.log(nextAppState);

        // })


        return () => {
            clearInterval(interval);
        }

    }, [latitude, longitude, targetCoords])



    async function reverseTarget() {
        // console.log('targetLocation', targetLocation);
        if (userTargetLocateAddr.length > 0 && userTargetLocateAddr != ' ' || userTargetLocateAddr != '') {
            await fetch(`https://api.geoapify.com/v1/geocode/search?text=${userTargetLocateAddr}&apiKey=${apiKey}`, requestOptions).then((res) => {
                // console.log(res.json());
                return res.json()

            }).then((data) => {
                // console.log('data',data.features[0].properties);
                gs_etUserLocation({
                    type: 'setTarget',
                    destination: data.features[0].properties,
                    userTarget: userTargetLocateAddr
                })

            })


        }

    }

    function stopObserving() {

        if (getWatchId !== null) {

            Geolocation.clearWatch(getWatchId)



        }
        setWatchId(null)

        // console.log(getWatchId);

    }


    return (

        <View>
            <Text>Notification Form</Text>
            <TextInput  placeholderTextColor='blue' placeholder={'Your recipient number. Include country code'} style={{ marginTop: 20, backgroundColor: '#fff', color: '#111' }} accessibilityLabel='Your recipient to send the message to' onChangeText={(e: any) => {

                gs_etUserLocation({
                    type: 'getNumber',
                    recipNumber: e
                })
            }}></TextInput>
            {/* <Text>{userContactNum}</Text> */}
            <Text>{latitude}:{longitude}</Text>
            <Text>{response.properties?.formatted}</Text>
            <Button onPress={getLocation} title='Click to get/update location'
                accessibilityLabel='Button to get your location'
                color='#333' />
            <Text>{getWatchId != null ? `watching:${getWatchId}` : `not watching : ${getWatchId}`}</Text>
            <Button onPress={stopObserving} title='Clicks to STOP observing'
                accessibilityLabel='Button to stop observing your location'
                color='#333' />

            <View>
                <Image style={{
                    backgroundColor: '#fff',
                    width: 420,
                    height: 200
                }} alt='Your location on a map' source={{
                    uri:
                        `https://maps.geoapify.com/v1/staticmap?style=osm-carto&format=jpeg&width=600&height=400&center=lonlat:${longitude},${latitude}&zoom=14.162&marker=lonlat:${longitude},${latitude};color:%23ff0000;size:small&apiKey=${apiKey}`
                }} />
            </View>
            <TextInput placeholderTextColor='blue' placeholder={'Your target Location'} style={{ marginTop: 20, backgroundColor: '#fff', color: '#111' }} accessibilityLabel='Target location address input' onChangeText={(e: any) => {

                gs_etUserLocation({
                    type: 'setTarget',
                    userTarget: e
                })
            }}></TextInput>
            <Text style={{
                margin: 20
            }}>Your target location: {userTargetLocateAddr}</Text>
            <Button onPress={reverseTarget} title='Click to set location'
                accessibilityLabel='Button to set your location'
                color='#333' />
            <Text>Target Coordinates:{targetCoords?.lat} : {targetCoords?.lon}</Text>
            <View>
                <Image style={{
                    backgroundColor: '#fff',
                    width: 420,
                    height: 200
                }} alt='Your target location on a map' source={{
                    uri:
                        `https://maps.geoapify.com/v1/staticmap?style=osm-carto&format=jpeg&width=600&height=400&center=lonlat:${targetCoords?.lon},${targetCoords?.lat}&zoom=14.162&marker=lonlat:${targetCoords?.lon},${targetCoords?.lat};color:%23ff0000;size:small&apiKey=${apiKey}`
                }} />
            </View>
            {/* <Button title='Activate Notifier' /> */}
            {/* <TextInput placeholderTextColor='blue' placeholder={'Recipient Contact Number'} style={{ backgroundColor: '#fff', color: '#111' }} accessibilityLabel='Recipient Contact Number' onChangeText={(e: any) => {
                // console.log(e);
                setNumber(e)

                // setNumber(e.target.value)
            }}></TextInput>
            <Text>Recipient: {userNumber}</Text>
            <Text>Your location: {response.properties?.formatted}</Text>
            
            <TextInput placeholderTextColor='blue' placeholder={'Your target Location'} style={{ backgroundColor: '#fff', color: '#111' }} accessibilityLabel='Target location address input' onChangeText={(e: any) => {
                // console.log(e);
                setTargetLocation(e)

                // setNumber(e.target.value)
            }}></TextInput>
            <Button onPress={reverseTarget} title='Click to set location'
                accessibilityLabel='Button to set your location'
                color='#333' />
            <Text>Your target location: {targetLocation}</Text>
            <Button title='Activate Notifier' /> */}
        </View>


    )

}
