import React, { Component } from "react";
import { connect } from "react-redux";
import {
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl
} from "react-native";
import _ from "lodash";
import ParallaxScrollView from "react-native-parallax-scroll-view";
import styles from "./styles";
import WrapperComponent from "../../components/Wrapper.component";
import Avatar from "../../components/Avatar";
import EventCard from "../../components/EventCard";
import AppActivityIndicator from "../../components/AppActivityIndicator";
import EventAPI from "../../api/event";
import { user } from "../../helpers/mock-data.helper";
import Text from "../../components/Text.component";
import { sizeWidth, sizeHeight } from "../../helpers/size.helper";
import AppEmpty from "../../components/AppEmpty";
import CardPlaceholder from "../../components/CardPlaceholder";

class ProfileComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingPastEvents: false,
      loadingMore: false,
      loadedPastEvents: false,
      pastEvents: [],
      refreshing: false,
      take: 10,
      hasNextPage: false,
      continuationKey: null
    };
    this.onFreshPastEvents = this.onFreshPastEvents.bind(this);
    this.onLoadMore = this.onLoadMore.bind(this);
  }

  _onPressEventItem = (eventId) => {
    this.props.navigation.navigate("About", { eventId });
  };

  _keyExtractor = (item, index) => `${index}`;

  _renderEventItem = ({ item }) => {
    const {loadingPastEvents, refreshing} = this.state;
    return (
      <View style={styles.containerEventItem}>
        <CardPlaceholder onReady={(!loadingPastEvents && !refreshing)}>
          <TouchableOpacity onPress={() => this._onPressEventItem(_.get(item, "eventId"))}>
            <EventCard event={item} withoutBottom />
          </TouchableOpacity>
        </CardPlaceholder>
      </View>
    );
  };

  _renderForeground = () => (
    <View style={styles.foregroundSection}>
      <View style={styles.containerHeader}>
        <Avatar user={user} size={sizeWidth(22)} />
        <View style={styles.containerInfo}>
          <Text style={styles.displayName}>{_.get(user, "displayName")}</Text>
          <Text style={styles.displayPosition}>
            {_.get(user, "displayPosition")}
          </Text>
          <Text style={[styles.displayPosition, { marginTop: sizeWidth(3) }]}>{_.get(user, "company")}</Text>
        </View>
      </View>
      <Text style={styles.title}>Past Events</Text>
    </View>
  );

  _renderStickyHeader = () => (
    <View style={[styles.containerHeader, styles.stickyHeader]}>
      <Avatar user={user} size={sizeWidth(10)} />
      <View style={styles.containerInfo}>
        <Text style={styles.smallDisplayName}>{_.get(user, "displayName")}</Text>
        <Text style={styles.smallDisplayPosition}>
          {_.get(user, "displayPosition")}
        </Text>
      </View>
    </View>
  );

  render() {
    const { pastEvents, refreshing } = this.state;
    return (
      <WrapperComponent>
        <ParallaxScrollView
          ref={ref => {
            this.parallaxScrollView = ref;
          }}
          backgroundColor={"transparent"}
          backgroundScrollSpeed={2}
          fadeOutForeground={true}
          parallaxHeaderHeight={sizeHeight(28)}
          renderForeground={this._renderForeground}
          stickyHeaderHeight={sizeHeight(12)}
          renderStickyHeader={this._renderStickyHeader}
          contentBackgroundColor={"transparent"}
          showsVerticalScrollIndicator={false}
        >
          <FlatList
            contentContainerStyle={styles.containerEvents}
            data={pastEvents}
            keyExtractor={this._keyExtractor}
            onEndReached={this.onLoadMore}
            onEndReachedThreshold={1}
            renderItem={this._renderEventItem}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={this.onFreshPastEvents}
                tintColor="#FFF"
              />
            }
            ListFooterComponent={() => {
              return (
                this.state.loadingMore && (
                  <AppActivityIndicator
                    color="#000"
                    containerStyles={{
                      paddingBottom: 20
                    }}
                  />
                )
              );
            }}
            ListEmptyComponent={<AppEmpty textColor={"#000"} />}
          />
        </ParallaxScrollView>
      </WrapperComponent>
    );
  }

  componentDidMount() {
    this.loadPastEvents();
  }

  async loadPastEvents() {
    const { take } = this.state;
    this.setState({
      loadingPastEvents: true,
      loadedPastEvents: false,
      pastEvents: [1, 2, 3, 4]
    });
    try {
      const data = await EventAPI.getPastEvents({
        take
      });
      const { events, hasNextPage, continuationKey } = data;
      this.setState({
        loadingPastEvents: false,
        loadedPastEvents: true,
        pastEvents: events,
        hasNextPage,
        continuationKey
      });
    } catch (e) {
      this.setState({
        loadingPastEvents: false,
        loadedPastEvents: false,
        pastEvents: [],
        hasNextPage: false,
        continuationKey: null
      });
    }
  }

  async onFreshPastEvents() {
    const { take } = this.state;
    this.setState({
      refreshing: true
    });
    const data = await EventAPI.getPastEvents({
      take
    });
    const { events, hasNextPage, continuationKey } = data;
    this.setState({
      pastEvents: events,
      refreshing: false,
      hasNextPage,
      continuationKey
    });
  }

  async onLoadMore() {
    const {
      hasNextPage,
      loadingMore,
      skip,
      take,
      pastEvents,
      loadingPastEvents,
      refreshing,
      continuationKey
    } = this.state;
    if (!hasNextPage || loadingMore || loadingPastEvents || refreshing) {
      return;
    }
    this.setState({
      loadingMore: true
    });
    const data = await EventAPI.getPastEvents({
      continuationKey,
      take
    });
    this.setState({
      pastEvents: pastEvents.concat(data.events),
      hasNextPage: data.hasNextPage,
      continuationKey: data.continuationKey,
      loadingMore: false
    });
  }

}

export default connect(
  null,
  null
)(ProfileComponent);
