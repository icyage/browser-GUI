<template>
    <b-card
        v-show="this.$store.state.settings.enableAssistant"
        header-tag="header"
        header-class="py-1 px-3"
        class="mr-3 shadow assistant-container"
        no-body
    >

        <template v-slot:header>
            <div @click="$store.commit('toggleAssistantBody')" style="cursor: pointer;">
                <b-icon icon="emoji-smile"></b-icon>
                Assistant
                
                <b-badge class="ml-3" v-show="!messagesRead && messageCount > 0" variant="primary">{{ messageCount }}</b-badge>

                <!-- visibility indicator -->
                <b-icon :icon="$store.state.session.assistant.showBody ? 'caret-down' : 'caret-up'" class="float-right"></b-icon>
            </div>
        </template>

        <b-collapse :visible="$store.state.session.assistant.showBody">
            <b-card-body class="p-3 assistant-body">
                <!-- v-for: Message Card(s) -->
                <div class="position-relative assistant-messages-wrapper" ref="messages">
                    <!-- older messages -->
                    <div
                        v-for="(msg, i) in $store.state.session.assistant.messageArchive" 
                        :key="msg.id"
                        class="clearfix"
                    >
                        <b-card
                            :bg-variant="msg.from == 'masq' ? 'primary' : 'secondary'" 
                            class="mb-3 p-2 text-white"
                            :class="{'ml-4': msg.from == 'user', 'mr-4': msg.from == 'masq', 'float-right': msg.from == 'user', 'float-left': msg.from == 'masq'}"
                            no-body
                        >
                            {{ msg.text }}
                        </b-card>
                    </div>

                    <!-- divider -->
                    <div v-show="$store.state.session.assistant.messageArchive.length > 0" class="mb-3 text-muted text-center" style="border-bottom: 1px solid gray;">older</div>


                    <!-- Placeholder: no messages -->
                    <div v-show="messageCount == 0" class="text-center text-muted">No assistance detected</div>

                    <!-- current messages -->
                    <div
                        v-for="(msg, i) in $store.state.session.assistant.messages" 
                        :key="msg.id"
                        class="clearfix"
                    >
                        <b-card
                            :bg-variant="msg.from == 'masq' ? 'primary' : 'secondary'" 
                            class="mb-3 p-2 text-white"
                            :class="{'ml-4': msg.from == 'user', 'mr-4': msg.from == 'masq', 'float-right': msg.from == 'user', 'float-left': msg.from == 'masq'}"
                            no-body
                            :ref="i == messageCount - 1 ? 'last_message' : 'msg_i'"
                        >
                            {{ msg.text }}
                        </b-card>
                    </div>

                    <!-- always bottom target to scroll to (hidden) -->
                    <div ref="bottom_target" class="position-absolute w-100" style="bottom:0; left:0; height:1px;"></div>
                </div>

                <!-- Response Input Bar -->
                <div>
                    <b-button
                        v-for="resp in $store.state.session.assistant.availUserResponses"
                        :key="resp.value"
                        @click="resp.callback(resp.value)"
                        variant="outline-info"
                        class="m-2"
                    >
                        {{ resp.text }}
                    </b-button>
                </div>
            </b-card-body>
        </b-collapse>

    </b-card>
</template>


<script>

export default {
    data() {
        return {
            messagesRead: false,
        }
    },
    methods: {
        scrollBottom: function() {
            // timeout helped a bug making it not go to the bottom
            setTimeout(() => {
                console.log('scrollHeight', this.$refs.messages.scrollHeight);
                this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight;
            }, 150);
        }
    },
    watch: {
        "$store.state.session.assistant.showBody": function(newVal, oldVal) {
            if(newVal) this.messagesRead = true; // assume messages have been read
            this.scrollBottom();
        },
        "$store.state.session.assistant.messageArchive": function() {
            this.scrollBottom();
        },
        "$store.state.session.assistant.messages": function(newMessages, oldMessages) {
            if(newMessages.length > 0 && !this.$store.state.session.assistant.showBody) this.messagesRead = false;
            this.scrollBottom();
        }
    },
    computed: {
        messageCount: function() {
            return this.$store.state.session.assistant.messages.length;
        }
    }
}
</script>

<style scoped>
    .assistant-container {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 28vw;
        max-width: 400px;
        z-index: +4;
    }

    .assistant-body {
        height: 47vh;
        max-height: 650px;
    }

    .assistant-messages-wrapper {
        height: calc(100% - 54px);
        overflow: scroll;
    }
</style>