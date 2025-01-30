import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  StyleSheet,
  Modal,
  RefreshControl,
  AppState
} from 'react-native';
import React, { useEffect, useRef } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MyStatusBar from '../../components/MyStatusbar';
import {
  base_url,
  colors,
  fonts,
  getFontSize,
} from '../../config/Constants';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import LinearGradient from 'react-native-linear-gradient';
import database from '@react-native-firebase/database';
import { connect } from 'react-redux';
import { useState } from 'react';
import MyLoader from '../../components/MyLoader';
import axios from 'axios';
import { useCallback } from 'react';
import * as ProviderActions from '../../redux/actions/ProviderActions';
import { Rating, AirbnbRating } from 'react-native-ratings';
import moment from 'moment';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { success_toast, warnign_toast } from '../../components/MyToastMessage';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as SettingActions from '../../redux/actions/SettingActions'
import { resetToScreen } from '../../navigations/NavigationServices';
import { Colors, Fonts, Sizes } from '../../assets/style';
import * as AuthActions from '../../redux/actions/AuthActions'
import { showNumber, showToastMessage } from '../../utils/services';
import * as ChatActions from '../../redux/actions/ChatActions'
import RenderHtml from 'react-native-render-html';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../../config/Screen';
// import { navigate } from '../../NavigationService';
import { color } from '@rneui/base';
import Feather from 'react-native-vector-icons/Feather';
import { navigate } from '../../NavigationService';
import * as HistoryActions from '../../redux/actions/HistoryActions'



const { width, height } = Dimensions.get('screen');

const ProviderHome = ({ providerData, navigation, dispatch, callRequestData, callVideoRequestData, anouncementData, videoCallHistoryData, chatHistoryData, callHistoryData, liveVedioCallHistoryData, offlineData, onlineData }) => {

  const { t } = useTranslation();
  const [isRefereshing, setIsRefereshing] = useState(false);
  const [date, setDate] = useState(null);
  const [anouncementsVisible, setAnouncementsVisible] = useState(false)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRemember] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [displayDuration, setDisplayDuration] = useState(onlineData?.data?.totalActiveDuration || 0);
  const [lastUpdatedDate, setLastUpdatedDate] = useState(new Date().toDateString());
  // const navigation = useNavigation();

  // console.log(liveVedioCallHistoryData?.length, 'chat count')

  useEffect(() => {
    dispatch(HistoryActions.getVideoCallHistory());
    dispatch(HistoryActions.getChatHistory());
    dispatch(HistoryActions.getCallHistory());
    dispatch(HistoryActions.getLiveVedioCallHistory())
    dispatch(HistoryActions.getOfflineData())
  }, [dispatch])


  // useEffect(() => {

  //   dispatch(SettingActions.updateChatStatus('online'));
  //   dispatch(SettingActions.updateCallStatus('online'));
  //   dispatch(SettingActions.updateVideoCallStatus('online'));
  // }, [dispatch]);


  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, []);

  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('App has come to the foreground!');
      }

      appState.current = nextAppState;
      setAppStateVisible(appState.current);
      if (appState.current == 'background') {

        console.log('appState background');
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    database().ref(`CurrentCall/${providerData?._id}`).on('value', snapshot => {
      try {
        if (snapshot.val()) {
          dispatch(ChatActions.setCallRequestData(snapshot.val()?.formId))
        } else {
          dispatch(ChatActions.setCallRequestData(null))
        }
      } catch (e) {
        console.log(e)
        dispatch(ChatActions.setCallRequestData(null))
      }
    });

    database().ref(`CurrentCallVideo/${providerData?._id}`).on('value', snapshot => {
      console.log('sanap ::::', snapshot.val());
      try {
        if (snapshot.val()) {
          dispatch(ChatActions.setCallVideoRequrestData(snapshot.val()?.formId))
        } else {
          dispatch(ChatActions.setCallVideoRequrestData(null))
        }
      } catch (e) {
        console.log(e)
        dispatch(ChatActions.setCallVideoRequrestData(null))
      }
    });
  }, []) // refresh 5 second

  // console.log(callVideoRequestData, 'vvd')


  useEffect(() => {
    getCredentials();
  }, []);

  const getCredentials = async () => {
    try {
      const storedCredentials = await AsyncStorage.getItem('astrologerCredentials');
      // console.log(storedCredentials);
      if (storedCredentials) {
        const { email: storedEmail, password: storedPassword, rememberMe: storedRememberMe } = JSON.parse(
          storedCredentials
        );
        setEmail(storedEmail);
        setPassword(storedPassword);
        setRemember(storedRememberMe);
      }
    } catch (error) {
      console.error('Error retrieving credentials:', error);
    }
  };



  const onNextOnline = () => {
    try {
      const ondatePick = (event, date) => {
        const onTimePick = (event, time) => {
          if (event.type === 'set') {
            console.log('start ')
            dispatch(SettingActions.onNextOnline({ date, time }))
          }
        }

        if (event.type === 'set') {
          DateTimePickerAndroid.open({
            value: new Date(),
            onChange: onTimePick,
            mode: 'time',
          });
        }
      }

      DateTimePickerAndroid.open({
        value: new Date(),
        onChange: ondatePick,
        mode: 'date',
      });
    } catch (e) {
      console.log(e)
    }
  }
  function formatFollowerCount(count) {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    } else {
      return count.toString();
    }
  }


  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.getHours().toString().padStart(2, '0'));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTotalOfflineDuration = (duration) => {
    const seconds = Math.floor(duration / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  };

  const formatTotalOnlineDuration = (duration) => {
    const seconds = Math.floor(duration / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  };


  useEffect(() => {
    setDisplayDuration(onlineData?.data?.totalActiveDuration || 0);

    const interval = setInterval(() => {
      const currentDate = new Date().toDateString();

      if (currentDate !== lastUpdatedDate) {
        setDisplayDuration(0);
        setLastUpdatedDate(currentDate);
      } else {
        setDisplayDuration((prevDuration) => prevDuration + 1000);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [onlineData, lastUpdatedDate]);

  const truncatedName = providerData?.astrologerName && providerData?.astrologerName?.length > 12
    ? `${providerData?.astrologerName?.slice(0, 12)}...`
    : providerData?.astrologerName;


  // Example usage
  let followerCount = providerData?.follower_count; // Replace with your actual follower count
  let formattedCount = formatFollowerCount(followerCount);

  return (
    <View style={{ flex: 1, backgroundColor: colors.white_color }}>
      <MyStatusBar
        backgroundColor={colors.new_color}
        barStyle="light-content"
      />
      <View style={{ flex: 0, padding: 10, paddingVertical: 2, }}>

        <View
          style={{
            flex: 0,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('astrologerDetailes')}
            style={{
              padding: 5, flexDirection: 'row',
              alignItems: 'center', width: SCREEN_WIDTH * 0.5,
            }}>
            <View style={{ height: SCREEN_WIDTH * 0.15, width: SCREEN_WIDTH * 0.15, overflow: 'hidden', borderRadius: 50 }}>
              <Image
                source={{ uri: base_url + providerData?.profileImage }}
                style={{ height: SCREEN_WIDTH * 0.15, width: SCREEN_WIDTH * 0.15, objectFit: "cover" }}
              />
            </View>
            <Text style={{ marginLeft: 4, ...Fonts.black16RobotoMedium }}> {truncatedName}</Text>
          </TouchableOpacity>
          <View style={{ display: "flex", flexDirection: "row", gap: 10, }}>
            <TouchableOpacity onPress={() => navigation.navigate('Notifications')} >
              <Feather name="bell" size={35} style={{ color: '#F45F4B' }} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.openDrawer()} >
              <Feather name="menu" size={35} style={{ color: '#F45F4B' }} />
            </TouchableOpacity>
          </View>
        </View>




      </View>
      <View style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefereshing}
              onRefresh={() => dispatch(SettingActions.onRefreshHomeScreen())}
            // onRefresh={on_referesh}
            />
          }>
          <View
            style={{
              flex: 0,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-around',
              borderBottomWidth: 1,
              borderTopWidth: 1,
              paddingVertical: 10,
              borderColor: colors.black_color5,
              marginTop: 5,
            }}>
            <TouchableOpacity style={styles.boxContainer}
              onPress={() => navigation.navigate('Walletwithdraw')}
            >

              <Text
                style={{
                  fontSize: 12,
                  color: "#fff",
                  fontFamily: fonts.semi_bold,

                }}>

                ₹{parseFloat(providerData?.wallet_balance).toFixed(2)}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: "#fff",
                  fontWeight: 'bold',
                  marginLeft: 5,
                }}>
                {t("wallet")}
              </Text>
            </TouchableOpacity>
            <View style={styles.boxContainer}>
              <Text
                style={{
                  fontSize: 12,
                  color: "#fff",
                  fontFamily: fonts.semi_bold,
                }}>

                {showNumber(providerData?.today_earnings?.earnings)}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: "#fff",
                  fontWeight: 'bold',
                  marginLeft: 5,
                  alignSelf: 'center'
                }}>
                {t('today_collection')}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('providerFollowing')}
              style={styles.boxContainer}>
              <Text
                style={{
                  fontSize: 12,
                  color: "#fff",
                  fontFamily: fonts.semi_bold,
                }}>
                {/* {providerData?.follower_count} */}
                {formattedCount}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  color: "#fff",
                  fontWeight: 'bold',
                  marginLeft: 5,
                }}>
                {t('following')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ paddingHorizontal: 15 }}>
            <View
              style={{
                flex: 0,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                marginTop: 20,
              }}>
              <TouchableOpacity
                onPress={() => {
                  if (providerData?.call_status == 'offline' || providerData?.call_status == 'busy') {
                    dispatch(SettingActions.updateCallStatus('online'))
                  } else {
                    dispatch(SettingActions.updateCallStatus('offline'))
                  }
                }}
                style={{
                  ...styles.boxContainerA,
                  backgroundColor:
                    providerData?.call_status == 'offline' || providerData?.call_status.length == 0
                      ? colors.black_color5 : providerData?.call_status == 'busy'
                        ? "#ffc600" : colors.green_color2,
                }}>
                <FontAwesome
                  name="phone"
                  color={colors.white_color}
                  size={16}
                />
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.white_color,
                    fontWeight: 'normal',
                    marginLeft: 5,
                  }}>
                  {providerData?.call_status.length == 0 ?
                    t("offline") : providerData?.call_status == 'online' ? t("online") :
                      providerData?.call_status == 'busy' ? t("busy") : t("offline")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (providerData?.video_call_status == 'offline' || providerData?.video_call_status == 'busy') {
                    dispatch(SettingActions.updateVideoCallStatus('online'))
                  } else {
                    dispatch(SettingActions.updateVideoCallStatus('offline'))
                  }
                }}
                // onPress={() => showToastMessage({ message: 'Feature Coming Soon' })}
                style={{
                  ...styles.boxContainerA,
                  backgroundColor:
                    providerData?.video_call_status == 'offline' || providerData?.video_call_status.length == 0
                      ? colors.black_color5 : providerData?.video_call_status == 'busy'
                        ? "#ffc600" : colors.green_color2,
                  // backgroundColor: colors.black_color5
                }}
              >
                <FontAwesome
                  name="video-camera"
                  color={colors.white_color}
                  size={16}
                />
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.white_color,
                    fontWeight: 'normal',
                    marginLeft: 5,
                  }}>
                  {providerData?.video_call_status.length == 0 ?
                    t("offline") : providerData?.video_call_status == 'online' ? t("online") :
                      providerData?.video_call_status == 'busy' ? t("busy") : t("offline")}
                  {/* Offline */}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                // onPress={() => setChatModalVisible(true)}
                onPress={() => {
                  if (providerData?.chat_status == 'offline' || providerData?.chat_status == 'busy') {
                    dispatch(SettingActions.updateChatStatus('online'))
                  } else {
                    dispatch(SettingActions.updateChatStatus('offline'))
                  }
                }}
                style={{
                  ...styles.boxContainerA,
                  backgroundColor:
                    providerData?.chat_status == 'offline' || providerData?.chat_status.length == 0
                      ? colors.black_color5 : providerData?.chat_status == 'busy'
                        ? "#ffc600" : colors.green_color2,
                }}>
                <FontAwesome
                  name="wechat"
                  color={colors.white_color}
                  size={16}
                />
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.white_color,
                    fontWeight: 'normal',
                    marginLeft: 5,
                  }}>
                  {providerData?.chat_status.length == 0 ? t("offline") :
                    providerData?.chat_status == 'online' ? t("online") : providerData?.chat_status == 'offline' ? t("offline") : t("busy")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('livePreview')}
                style={{
                  ...styles.boxContainerA,
                  backgroundColor: colors.new_color,
                }}>
                {/* <FontAwesome
                  name="video-camera"
                  color={colors.white_color}
                  size={getFontSize(2)}
                /> */}
                <Image source={require('../../assets/images/icon/live.png')} style={{ height: SCREEN_WIDTH * 0.05, width: SCREEN_WIDTH * 0.05 }} />
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.white_color,
                    fontWeight: 'normal',
                    marginLeft: 5,
                  }}>
                  {t("go_live")}
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => onNextOnline()}
              style={{
                ...styles.boxContainerA,
                width: '100%',
                backgroundColor: providerData?.nextOnline?.date ? colors.green_color2 : "#f45f4b",
              }}>
              {/* <FontAwesome
                name="phone"
                color={colors.white_color}
                size={getFontSize(2)}
              /> */}
              <Text
                style={{
                  fontSize: 14,
                  color: colors.white_color,
                  fontWeight: 'normal',
                  marginLeft: 5,
                }}>
                {t("new_online")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('announcementdetails')}
              style={{
                flex: 0,
                padding: 10,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: "#f45f4b47",
                borderWidth: 1,
                borderColor: "#f45f4b47",
                marginTop: 15,
                borderRadius: 5,

                shadowColor: colors.black_color7,
                shadowOffset: { width: 2, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 5,
              }}>
              <TouchableOpacity style={{ flex: 0, width: '90%' }}
                onPress={() => navigation.navigate('announcementdetails')}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: "#000",
                    fontFamily: fonts.medium,
                    marginBottom: 5,

                  }}>
                  {t('AstroRemedy')}{'\n'}{t("announcement_message")}{'\n'}{t("please_check")}
                </Text>
              </TouchableOpacity>
              <View
                style={{
                  flex: 0,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('announcementdetails')
                  }}
                  disabled={anouncementData ? anouncementData?.length == 0 : false}
                  style={{
                    flex: 0,
                    width: 30,
                    height: 30,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: "#F45F4B",
                    borderRadius: 4,
                  }}>
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#fff",
                      fontWeight: 'normal',
                    }}>
                    {anouncementData ? anouncementData.length : 0}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>



            <View style={{
              marginTop: 20, flex: 0,
              flexDirection: 'row', justifyContent: 'space-between',
            }}>
              <TouchableOpacity

                activeOpacity={0.8}
                onPress={() => {
                  navigation.navigate('videohistory');
                }}
                style={{ flex: 0 }}>
                <LinearGradient
                  colors={['#ff9966', '#ff5e62']}
                  style={{
                    width: width * 0.42,
                    alignItems: 'center',
                    marginBottom: 15,
                    borderRadius: 10,
                    elevation: 8,
                    shadowColor: colors.black_color4,
                    paddingVertical: 15,
                  }}>
                  <View
                    style={{

                    }}>
                  </View>

                  <Text
                    style={{
                      fontSize: getFontSize(2),
                      color: colors.white_color,
                      marginTop: 5,
                      fontWeight: 'bold',
                      textAlign: 'center',
                    }}>
                    {/* Today Active{'\n'} Time */}
                    {t("Today Active")}{"\n"}{t("Time")}
                  </Text>
                  <View >
                    <Text
                      style={{
                        fontSize: 13,
                        color: colors.white_color,
                        marginTop: 3,
                        fontFamily: fonts.medium,
                        textAlign: 'center',
                      }}>
                      <Text>{formatTotalOnlineDuration(displayDuration)}</Text>
                    </Text>
                  </View>

                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  navigation.navigate('videohistory');
                }}
                style={{ flex: 0 }}>
                <LinearGradient
                  colors={['#ff9966', '#ff5e62']}
                  style={{
                    width: width * 0.42,
                    alignItems: 'center',
                    marginBottom: 15,
                    borderRadius: 10,
                    elevation: 8,
                    shadowColor: colors.black_color4,
                    paddingVertical: 15,
                  }}>
                  <View
                    style={{

                    }}>

                  </View>

                  <Text
                    style={{
                      fontSize: getFontSize(2),
                      color: colors.white_color,
                      marginTop: 5,
                      fontWeight: 'bold',
                      textAlign: 'center',
                    }}>
                    {t("Today InActive")}{"\n"}{t("Time")}
                  </Text>
                  <View >
                    <Text
                      style={{
                        fontSize: 13,
                        color: colors.white_color,
                        marginTop: 3,
                        fontFamily: fonts.medium,
                        textAlign: 'center',
                      }}>
                      <Text> {formatTotalOfflineDuration(offlineData?.data?.totalOfflineDuration)}</Text>
                    </Text>
                  </View>

                </LinearGradient>

              </TouchableOpacity>
            </View>


            <View
              style={{
                flex: 0,
                padding: 15,
                backgroundColor: colors.background_theme1,
                marginTop: 10,
                borderRadius: 10,
                shadowColor: colors.black_color6,
                shadowOffset: { width: 2, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 5,
              }}>
              <View
                style={{
                  flex: 0,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                {/* <FontAwesome
                  name="bar-chart"
                  color={colors.yellow_color1}
                  size={getFontSize(2)}
                /> */}
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.black_color,
                    fontWeight: 'bold',
                    marginLeft: 5,
                    marginBottom: 8
                  }}>
                  {t("Your Pickup Order History")}
                </Text>
              </View>
              <View
                style={{
                  flex: 0,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 20,
                }}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    navigation.navigate('chatHistory');
                  }}
                  style={{ flex: 0 }}>
                  <LinearGradient
                    colors={['#FDC830', '#F37335']}
                    style={{
                      flex: 0,
                      width: width * 0.42,
                      height: SCREEN_HEIGHT * 0.15,
                      // justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: 15,
                      borderRadius: 10,
                      marginLeft: -5,
                      marginRight: 8,
                      elevation: 8,
                      shadowColor: colors.black_color4,
                    }}>
                    <View
                      style={{
                        flex: 0,
                        flexDirection: 'row',
                        alignItems: 'center',

                        marginTop: -15
                      }}>
                      <View
                        style={{
                          flex: 0,
                          width: 30,
                          height: 30,
                          justifyContent: 'center',
                          alignItems: 'center',
                          backgroundColor: '#FFFFFF',
                          borderRadius: 100,
                          marginBottom: 2,
                          borderWidth: 1,
                          borderColor: colors.new_color

                        }}>
                        <Text
                          style={{
                            fontSize: getFontSize(1.5),
                            color: colors.new_color,
                            fontFamily: fonts.medium,
                          }}>
                          1
                        </Text>
                      </View>
                      {/* <View style={{ flex: 0}}>
                    <FontAwesome name='question-circle-o' color={colors.black_color} size={18} />
                    </View> */}
                    </View>
                    {/* <View style={styles.boxContainerB}>
                      <Text style={{ fontSize: 12, color: colors.white_color }}>
                        Chat
                      </Text>
                    </View> */}
                    <Text
                      style={{
                        fontSize: getFontSize(2),
                        color: colors.white_color,
                        marginTop: 3,
                        fontWeight: 'bold',
                        textAlign: 'center',
                        // fontFamily: fonts.montserrat_medium,
                      }}>
                      {chatHistoryData?.length}
                    </Text>
                    <View style={{ flex: 0, width: '80%' }}>
                      <Text
                        style={{
                          fontSize: getFontSize(1.4),
                          color: colors.white_color,
                          marginTop: 1,
                          fontFamily: fonts.medium,
                          textAlign: 'center',
                        }}>
                        {t('Total Chat')}


                      </Text>
                    </View>
                    <View style={styles.boxContainerB}>
                      <Text style={{ fontSize: 12, color: colors.new_color }}>
                        {t("Chat")}
                      </Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    navigation.navigate('callHistory');
                  }}
                  style={{ flex: 0 }}>
                  <LinearGradient
                    colors={['#38ef7d', '#11998e']}
                    style={{
                      flex: 0,
                      width: width * 0.42,
                      height: SCREEN_HEIGHT * 0.15,

                      //justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: 15,
                      borderRadius: 10,
                      elevation: 8,
                      shadowColor: colors.black_color4,
                    }}>
                    <View
                      style={{
                        flex: 0,
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      <View
                        style={{
                          flex: 0,
                          width: 30,
                          height: 30,
                          justifyContent: 'center',
                          alignItems: 'center',
                          backgroundColor: '#ffffff',
                          borderRadius: 100,
                          marginTop: -15,
                          borderColor: colors.new_color,
                          borderWidth: 1
                        }}>
                        <Text
                          style={{
                            fontSize: getFontSize(1.5),
                            color: colors.new_color,
                            fontFamily: fonts.medium,
                          }}>
                          2
                        </Text>
                      </View>
                    </View>
                    {/* <View style={styles.boxContainerB}>
                      <Text
                        style={{
                          fontSize: getFontSize(1.4),
                          color: colors.white_color,
                          textAlign: 'center',
                        }}>
                        Call
                      </Text>
                    </View> */}
                    <Text
                      style={{
                        fontSize: getFontSize(2),
                        color: colors.white_color,
                        marginTop: 5,
                        fontWeight: 'bold',
                        textAlign: 'center',
                        // fontFamily: fonts.montserrat_medium,
                      }}>
                      {callHistoryData?.length}
                    </Text>
                    <View style={{ flex: 0, width: '80%' }}>
                      <Text
                        style={{
                          fontSize: getFontSize(1.4),
                          color: colors.white_color,
                          marginTop: 0.5,
                          fontFamily: fonts.medium,
                          textAlign: 'center',
                        }}>
                        {t('Total Voice Call')}
                      </Text>
                    </View>
                    <View style={styles.boxContainerB}>
                      <Text
                        style={{
                          fontSize: 12,
                          color: colors.new_color,
                          textAlign: 'center',
                        }}>
                        {t("Call")}
                      </Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

              </View>


              <View
                style={{
                  flex: 0,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 6,
                }}>

                <TouchableOpacity
                  // disabled={true}
                  activeOpacity={0.8}
                  onPress={() => {
                    navigation.navigate('videohistory');
                  }}
                  style={{ flex: 0 }}>
                  <LinearGradient
                    colors={['#ff9966', '#ff5e62']}
                    style={{
                      flex: 0,
                      marginLeft: -5,
                      marginRight: 8,

                      width: width * 0.42,
                      height: SCREEN_HEIGHT * 0.15,
                      //  justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: 15,
                      borderRadius: 10,
                      elevation: 8,
                      shadowColor: colors.black_color4,
                    }}>
                    <View
                      style={{
                        flex: 0,
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      <View
                        style={{
                          flex: 0,
                          width: 30,
                          height: 30,
                          justifyContent: 'center',
                          alignItems: 'center',
                          backgroundColor: '#ffffff',
                          borderRadius: 100,
                          marginTop: -15,
                          borderWidth: 1,
                          borderColor: colors.new_color
                        }}>
                        <Text
                          style={{
                            fontSize: getFontSize(1.5),
                            color: colors.new_color,
                            fontFamily: fonts.medium,
                          }}>
                          3
                        </Text>
                      </View>
                    </View>
                    {/* <View style={styles.boxContainerB}>
                      <Text
                        style={{
                          fontSize: getFontSize(1.4),
                          color: colors.white_color,
                          textAlign: 'center',
                        }}>
                        Live/Video
                      </Text>
                    </View> */}
                    <Text
                      style={{
                        fontSize: getFontSize(2),
                        color: colors.white_color,
                        marginTop: 5,
                        fontWeight: 'bold',
                        textAlign: 'center',
                        // fontFamily: fonts.montserrat_medium,
                      }}>
                      {videoCallHistoryData?.length}
                    </Text>
                    <View style={{ flex: 0, width: '80%' }}>
                      <Text
                        style={{
                          fontSize: 13,
                          color: colors.white_color,
                          marginTop: 3,
                          fontFamily: fonts.medium,
                          textAlign: 'center',
                        }}>
                        {t("Total Video Call")}
                      </Text>
                    </View>
                    <View style={styles.boxContainerB}>
                      <Text
                        style={{
                          fontSize: 12,
                          color: colors.new_color,
                          textAlign: 'center',
                        }}>
                        {t("Video")}
                      </Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    navigation.navigate('liveHistory');
                  }}
                  style={{ flex: 0 }}>
                  <LinearGradient
                    colors={['#70FF5B', '#28BF12']}
                    style={{
                      flex: 0,
                      width: width * 0.42,
                      height: SCREEN_HEIGHT * 0.15,
                      //  justifyContent: 'center',
                      alignItems: 'center',
                      marginBottom: 15,
                      borderRadius: 10,
                      elevation: 8,
                      shadowColor: colors.black_color4,
                    }}>
                    <View
                      style={{
                        flex: 0,
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      <View
                        style={{
                          flex: 0,
                          width: 30,
                          height: 30,
                          justifyContent: 'center',
                          alignItems: 'center',
                          backgroundColor: '#ffffff',
                          borderRadius: 100,
                          marginTop: -15,
                          borderWidth: 1,
                          borderColor: colors.new_color
                        }}>
                        <Text
                          style={{
                            fontSize: getFontSize(1.5),
                            color: colors.new_color,
                            fontFamily: fonts.medium,
                          }}>
                          4
                        </Text>
                      </View>
                    </View>
                    {/* <View style={styles.boxContainerB}>
                      <Text
                        style={{
                          fontSize: getFontSize(1.4),
                          color: colors.white_color,
                          textAlign: 'center',
                        }}>
                        Live/Video
                      </Text>
                    </View> */}
                    <Text
                      style={{
                        fontSize: getFontSize(2),
                        color: colors.white_color,
                        marginTop: 5,
                        fontWeight: 'bold',
                        textAlign: 'center',
                        // fontFamily: fonts.montserrat_medium,
                      }}>
                      {liveVedioCallHistoryData?.length}
                    </Text>
                    <View style={{ flex: 0, width: '80%' }}>
                      <Text
                        style={{
                          fontSize: getFontSize(1.4),
                          color: colors.white_color,
                          marginTop: 1,
                          fontFamily: fonts.medium,
                          textAlign: 'center',
                        }}>
                        {t("Total Live Call")}
                      </Text>
                    </View>
                    <View style={styles.boxContainerB}>
                      <Text
                        style={{
                          fontSize: 12,
                          color: colors.new_color,
                          textAlign: 'center',
                        }}>
                        {t("Live")}
                      </Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>


            </View>
            {callRequestData && <TouchableOpacity
              onPress={() => navigation.navigate('intakeDetails')}
              style={{
                flex: 0,
                padding: 12,

                backgroundColor: colors.new_color,
                borderRadius: 5,
                marginBottom: 10,
              }}>
              <Text
                style={{
                  fontSize: getFontSize(1.4),
                  color: colors.white_color,
                  fontFamily: fonts.medium,
                }}>
                View Kundli for Current Call
              </Text>
            </TouchableOpacity>
            }
            {callVideoRequestData && <TouchableOpacity
              onPress={() => navigation.navigate('intakeDetails')} // new page
              style={{
                flex: 0,
                padding: 12,

                backgroundColor: colors.new_color,
                borderRadius: 5,
              }}>
              <Text
                style={{
                  fontSize: getFontSize(1.4),
                  color: colors.white_color,
                  fontFamily: fonts.medium,
                }}>
                {t("View Kundli for Current Video Calls")}
              </Text>
            </TouchableOpacity>}

            <View style={{ display: "flex", flexDirection: "row", marginBottom: 5 + -0, gap: 10, marginTop: 15 }}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Assignedpuja')}
                style={{
                  flex: 0,
                  padding: 12,
                  backgroundColor: colors.new_color,
                  borderRadius: 5,
                  width: "49%"
                }}>
                <Text
                  style={{
                    fontSize: getFontSize(1.4),
                    color: colors.white_color,
                    fontFamily: fonts.medium,
                    textAlign: 'center'
                  }}>
                  {t("Assigned Puja")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate('Completepuja')}
                style={{
                  flex: 0,
                  padding: 12,
                  backgroundColor: colors.new_color,
                  borderRadius: 5,
                  width: "49%"
                }}>
                <Text
                  style={{
                    fontSize: getFontSize(1.4),
                    color: colors.white_color,
                    fontFamily: fonts.medium,
                    textAlign: 'center'
                  }}>
                  {t("Completed Puja")}
                </Text>
              </TouchableOpacity>
            </View>

          </View>


        </ScrollView>
      </View>
      <Modal
        visible={anouncementsVisible}
        transparent={true}
      >
        <View style={styles.modalContainerA}>
          <View style={styles.modalContainerBB}>
            <View style={styles.modalContainerC}>
              <Text style={styles.modalTextA}>{t("announcement")}</Text>
              <TouchableOpacity
                onPress={() => {
                  dispatch(ProviderActions.onReadAnouncement(anouncementData[0]?._id))
                  setAnouncementsVisible(false);
                }}
                style={{ padding: 3 }}>
                <Ionicons
                  name="close-outline"
                  color={colors.black_color8}
                  size={25}
                />
              </TouchableOpacity>
            </View>
            {anouncementData?.[0]?.description && <RenderHtml source={{ html: anouncementData?.[0]?.description }} contentWidth={SCREEN_WIDTH} />}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const mapStateToProps = state => ({
  providerData: state.provider.providerData,
  callRequestData: state.chat.callRequestData,
  callVideoRequestData: state.chat.callVideoRequestData,
  anouncementData: state.provider.anouncementData,
  videoCallHistoryData: state.history.videoCallHistoryData,
  chatHistoryData: state.history.chatHistoryData,
  callHistoryData: state.history.callHistoryData,
  liveVedioCallHistoryData: state.history.liveVedioCallHistoryData,
  offlineData: state.history.offlineData,
  onlineData: state.history.onlineData,
});

const mapDispatchToProps = dispatch => ({ dispatch });

export default connect(mapStateToProps, mapDispatchToProps)(ProviderHome);

const styles = StyleSheet.create({
  boxContainer: {
    flex: 0,
    width: '30%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#F45F4B",
    borderRadius: 5,
    paddingVertical: 4,
    backgroundColor: '#F45F4B'
  },
  boxContainerA: {
    flex: 0,
    width: '48%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.green_color2,
    paddingVertical: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  boxContainerB: {
    flex: 0,
    width: '60%',
    borderWidth: 1,
    borderColor: colors.white_color,
    shadowColor: colors.black_color7,
    shadowOffset: { width: -2, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    height: '20%',
    borderRadius: 20,
    marginTop: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white_color,
  },

  modalContainerA: {
    flex: 1,
    backgroundColor: colors.black_color9 + '80',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainerB: {
    flex: 0,
    width: '90%',
    backgroundColor: colors.background_theme1,
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
  },
  modalContainerBB: {
    flex: 0,
    width: '90%',
    backgroundColor: colors.background_theme1,
    borderRadius: 20,
    padding: 15,
    maxHeight: 300,
    overflow: 'scroll',
  },
  modalContainerC: {
    flex: 0,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTextA: {
    fontSize: getFontSize(1.5),
    color: colors.background_theme2,
    fontFamily: fonts.semi_bold,
  },
  modalTextB: {
    fontSize: getFontSize(1.4),
    color: colors.black_color,
    fontFamily: fonts.medium,
  },
  box: {
    height: 50,
    width: 50,
    backgroundColor: colors.background_theme1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },
});
