import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
  ScrollView,
  Animated,
  Dimensions,
  StyleSheet,
  Image,
  TextInput,
  ImageBackground,
  FlatList,
} from 'react-native';
import React from 'react';
import { useEffect } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, delete_live, fonts, getFontSize } from '../../config/Constants';

import { useState } from 'react';
import axios from 'axios';
import { livelist, api_url, img_url_astrologer, astrolivehistory } from '../../config/Constants';
import { connect } from 'react-redux';
import MyLoader from '../../components/MyLoader';
import moment from 'moment';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { success_toast } from '../../components/MyToastMessage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('screen');

const LiveList = props => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [kundliList, setKundliList] = useState(null);
  const [history, sethistory] = useState(null);

  useEffect(() => {
    props.navigation.setOptions({
      tabBarLabel: t('live'),
    });
  }, []);

  useEffect(() => {
    get_kundli();
    gethistory();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      get_kundli();
      gethistory();
    }, [])
  );

  const get_kundli = async () => {
    setIsLoading(true);
    await axios({
      method: 'post',
      url: api_url + livelist,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      data: {
        user_id: props.providerData.id,
      },
    })
      .then(res => {
        console.log(res.data);
        console.log('teee', res.data.data);
        setKundliList(res.data.data);
        setIsLoading(false);
      })
      .catch(err => {
        console.log('ttt', err);
        setIsLoading(false);
      });
  };

  const gethistory = async () => {
    setIsLoading(true);
    await axios({
      method: 'post',
      url: api_url + astrolivehistory,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      data: {
        astro_id: props.providerData.id,
      },
    })
      .then(res => {
        console.log(res.data.data);
        sethistory(res.data.data);
        setIsLoading(false);
      })
      .catch(err => {
        console.log(err);
        setIsLoading(false)
      });
  };

  const delete_data = async(id) => {
    console.log(id);
    setIsLoading(true);
    await axios({
      method: 'post',
      url: api_url + delete_live,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      data: {
        liveId: id,
      },
    })
      .then(res => {
        console.log(res.data);
        if(res.data.status == 1)
        {
          console.log('ADF');
          success_toast('Delete Successfully');
          gethistory();
        }
        
        setIsLoading(false);
      })
      .catch(err => {
        console.log(err);
        setIsLoading(false)
      });
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.black_color1 }}>
      <MyLoader isVisible={isLoading} />
      <View style={{ width: '95%', alignSelf: 'center' }}>
        <Text
          style={{
            fontSize: 16,
            marginBottom: 10,
            marginTop: 10,
            fontFamily: fonts.medium,
            color: colors.black_color7,
          }}>
          {t('new_live')}
        </Text>
        {kundliList !== null && kundliList.length > 0 ? (
          <FlatList
            data={kundliList}
            horizontal
            renderItem={({ item, index }) => (
              <TouchableOpacity
                onPress={() => props.navigation.navigate('livenow', { data: item })}
                activeOpacity={0.6}
                key={index}
                style={{
                  flex:1,
                  flexDirection: 'row',
                  paddingHorizontal: 15,
                  paddingVertical: 20,
                  backgroundColor: colors.background_theme1,
                  marginBottom: 15,
                  borderRadius: 10,
                  shadowColor: '#eee',
                  shadowOffset: {
                    width: 5,
                    height: 5,
                  },
                  shadowOpacity: 1,
                  shadowRadius: 5,
                  elevation: 5,
                  width:350
                }}>
                <View style={{ width: '50%', flexDirection: 'row', alignItems: 'center' }}>
                  <Image
                    source={{ uri: img_url_astrologer + props.providerData.img_url }}
                    style={{
                      width: width * 0.15,
                      height: width * 0.15,
                      resizeMode: 'contain',
                      marginRight: 10,
                    }}
                  />
                  <View>
                    <Text style={{ fontSize: 14, color: colors.black_color7, fontFamily: fonts.bold }}>
                      {item.title}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.black_color7, fontFamily: fonts.medium }}>
                      {item.description}
                    </Text>
                  </View>
                </View>
                <View style={{ width: '50%', justifyContent: 'center' }}>
                  <View>
                    {/* <Text style={{ color: 'black' }}>id: {item.id}</Text> */}
                    <Text style={{ color: 'black' }}>{t("time")}: {item.time}</Text>
                    <Text style={{ color: 'black' }}>{t("date")}: {moment(item.date).format('DD-MM-yyyy')}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        ) : (
          <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: 20, marginBottom: 20 }}>
            <Text style={{ color: 'black' }}>{t("noData")}</Text>
          </View>
        )}

      </View>
      <View style={{ width: '95%', alignSelf: 'center', flex: 1 }}>
        <Text
          style={{
            fontSize: 16,
            marginBottom: 10,
            fontFamily: fonts.medium,
            color: colors.black_color7,
          }}>
          {t('live_create_history')}
        </Text>
        {history !== null && history.length > 0 ? (
          <FlatList
            data={history}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                // onPress={()=>props.navigation.navigate('showKundli', {data: item})}
                activeOpacity={0.6}
                key={index}
                style={{
                  flex: 0,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 15,
                  paddingVertical: 20,
                  backgroundColor: colors.background_theme1,
                  marginBottom: 15,
                  borderRadius: 10,
                  shadowColor: '#eee',
                  shadowOffset: {
                    width: 5,
                    height: 5,
                  },
                  shadowOpacity: 1,
                  shadowRadius: 5,
                  elevation: 5
                }}>
                <View
                  style={{ flex: 0, flexDirection: 'row', alignItems: 'center' }}>
                  <Image
                    source={{ uri: img_url_astrologer + props.providerData.img_url }}
                    style={{
                      width: width * 0.1,
                      height: width * 0.1,
                      resizeMode: 'contain',
                    }}
                  />
                  <View style={{ marginLeft: 10 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        color: colors.black_color7,
                        fontFamily: fonts.bold,
                      }}>
                      {item.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: colors.black_color7,
                        fontFamily: fonts.medium,
                      }}>
                      {item.description}
                    </Text>
                  </View>
                </View>
                
                <View style={{ flex: 0, flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{}}>
                    <Text style={{ color: 'black' }}>Status: {item.status}</Text>
                    <Text style={{ color: 'black' }}>Date: {item.Date}</Text>
                  </View>
                </View>
                <View>
                <TouchableOpacity
                style={{right:0,position:'absolute'}}
                onPress={()=>delete_data(item.id)}>
                  <MaterialIcons 
                    name="delete"
                    color={colors.black_color7}
                    size={getFontSize(2.2)}
                  />
                </TouchableOpacity>
                </View>
                
              </TouchableOpacity>
            )}
          />
        ) : (
          <View style={{ justifyContent: 'center', alignSelf: "center", marginTop: 100, marginBottom: 20 }}>
            <Text style={{ color: 'black' }}>{t("noData")}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const mapStateToProps = state => ({
  providerData: state.provider.providerData,
});

export default connect(mapStateToProps, null)(LiveList);

const styles = StyleSheet.create({
  containerBox: {
    flex: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background_theme3,
    borderRadius: 10,
    shadowColor: colors.black_color5,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    marginBottom: 15,
  },
  childContainerBox: {
    flex: 1,
    padding: 10,
  },
  heading: {
    fontSize: 16,
    color: colors.black_color,
    fontFamily: fonts.semi_bold,
    marginBottom: 15,
  },
  description: {
    fontSize: 13,
    color: colors.black_color,
    fontFamily: fonts.medium,
  },
  circle: {
    flex: 0,
    width: width * 0.2,
    height: width * 0.2,
    borderRadius: 1000,
    borderWidth: 8,
    borderColor: colors.green_color2,
    marginRight: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleText: {
    fontSize: 22,
    color: colors.green_color2,
    fontFamily: fonts.bold,
  },
});
