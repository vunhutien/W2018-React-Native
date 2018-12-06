import React, { Component } from "react";
import { connect } from "react-redux";
import {
  View,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  ImageBackground
} from "react-native";
import Text from "../../components/Text.component";
import styles from "./styles";
import { CommonStyles, COLORS } from "../../helpers/common-styles";
import WrapperComponent from "../../components/Wrapper.component";
import EventCard from "../../components/EventCard";
import ParallaxScrollView from "react-native-parallax-scroll-view";
import EventAPI from "../../api/event";
import _ from "lodash";
import AppEmpty from "../../components/AppEmpty";
import AppActivityIndicator from "../../components/AppActivityIndicator";
import { isCloseToBottom } from "../../helpers/function.helper";
import { sizeHeight, sizeWidth } from "../../helpers/size.helper";

class Search extends Component {
  constructor () {
    super();
    this.state = {
      searchKey: "",
      take: 10,
      events: [],
      loading: false,
      loaded: false,
      loadingMore: false,
      hasNextPage: false,
      continuationKey: null,
      firstInit: true
    };
    this.searchMyEventsDelayed = _.debounce(this.searchMyEvents, 1000);
    this.onScroll = this.onScroll.bind(this);
  }
  render() {
    const { events, firstInit } = this.state;
    if (firstInit) {
      return this._renderEmptyState();
    }
    return (
      <WrapperComponent>
        <ParallaxScrollView
          ref={ref => {
            this.parallaxScrollView = ref;
          }}
          backgroundColor={"transparent"}
          backgroundScrollSpeed={2}
          fadeOutForeground={true}
          parallaxHeaderHeight={sizeHeight(30)}
          renderForeground={this._renderForeground}
          stickyHeaderHeight={sizeHeight(13)}
          renderStickyHeader={this._renderStickyHeader}
          contentBackgroundColor={"transparent"}
          showsVerticalScrollIndicator={false}
          onMomentumScrollEnd={this.onScroll}
          scrollEventThrottle={500}
          
        >
          { this._renderSearchResult(events) }
        </ParallaxScrollView>
      </WrapperComponent>
    );
  }

  _renderForeground = () => {
    const { loaded, events } = this.state;
    return (
      <View style={styles.foregroundSection}>
        <View style={CommonStyles.header}>
          <Text style={CommonStyles.title}>Search</Text>
        </View>
        <View>
          { this._renderSearchBox() }
          {
            (loaded && !_.isEmpty(events) ) && <Text style={styles.founds}>Search Results ({events.length})</Text>
          }
        </View>
      </View>
    );
  };
  _renderStickyHeader = () => (
    <View style={styles.stickyHeader}>
      {
        this._renderSearchBox()
      }
    </View>
  );

  _renderSearchBox = () => (
    <View style={styles.searchBox}>
      <Image
        source={require("../../../assets/images/search_white.png")}
        style={styles.searchIcon}
        resizeMode={"contain"}
      />
      <TextInput
        placeholder={"Say something..."}
        style={styles.searchInput}
        underlineColorAndroid="transparent"
        placeholderTextColor={COLORS.PALE_NAVY}
        value={this.state.searchKey}
        onChangeText={(searchKey) => this.onSearchText(searchKey)}
      />
    </View>
  );

  _renderSearchResult = events => (
    <View style={styles.listContainer}>
    {
      this.state.loading ? <AppActivityIndicator /> : (
        <FlatList
          data={events}
          keyExtractor={(item, index) => `${index}`}
          renderItem={this._renderItem}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={() => {
            return (
              this.state.loadingMore && <AppActivityIndicator color="#000" containerStyles={{
                paddingBottom: 20
              }} />
            )
          }}
          ListEmptyComponent={() => <AppEmpty textColor={"#FFF"} />}
        />
      )
    }
    </View>
  );

  _renderItem = ({item}) => (
    <TouchableOpacity
      style={{
        marginBottom: sizeWidth(3), 
        paddingHorizontal: sizeWidth(3), 
        ...CommonStyles.boxShadow 
      }}
      onPress={() => this.onGoDetail(_.get(item, "eventId"))}
    >
      <EventCard event={item} />
    </TouchableOpacity>
  );

  _renderEmptyState = () => (
    <ImageBackground 
      source={require("../../../assets/images/empty_state.png")}
      style={[CommonStyles.container, styles.emptyContainer]}>
      <Text style={styles.emptyText}>No events available at the moment</Text>
      <TouchableOpacity style={styles.emptyButton} onPress={() => this.setState({ firstInit: false })}>
        <Text style={styles.emptyButtonText}>New Search</Text>
      </TouchableOpacity>
    </ImageBackground>
  );

  onGoDetail (eventId) {
    this.props.navigation.navigate("About", { eventId });
  }

  onSearchText (searchKey) {
    if (_.isEmpty(searchKey)) {
      this.setState({ 
        searchKey,
        loading: false,
        loaded: false,
        events: [],
        hasNextPage: false
      });
      this.searchMyEventsDelayed.cancel();
      return;
    }
    this.setState({ 
      searchKey,
      loading: true,
      loaded: false
    });
    this.searchMyEventsDelayed(searchKey);
  }

  async searchMyEvents () {
    const {
      take,
      searchKey
    } = this.state;
    try {
      const data = await EventAPI.searchEvents({
        take,
        searchKey
      });
      const { events, hasNextPage, continuationKey } = data;
      this.setState({
        loading: false,
        loaded: true,
        events,
        hasNextPage,
        continuationKey
      });
    } catch (e) {
      this.setState({
        loading: false,
        loaded: false,
        events: [],
        hasNextPage: false,
        continuationKey: null
      });
    };
  }

  async onLoadMore () {
    const {
      loadingMore,
      take,
      searchKey,
      events,
      hasNextPage,
      continuationKey
    } = this.state;
    if (!hasNextPage || loadingMore) {
      return;
    }
    this.setState({
      loadingMore: true
    });
    const data = await EventAPI.searchEvents({
      searchKey,
      take,
      continuationKey
    });
    this.setState({
      events: events.concat(data.events),
      hasNextPage: data.hasNextPage,
      continuationKey: data.continuationKey,
      loadingMore: false
    });
  }

  onScroll ({nativeEvent}) {
    if (isCloseToBottom(nativeEvent)) {
      this.onLoadMore();
    }
  }
}

export default connect(
  null,
  null
)(Search);
