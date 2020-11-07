<template>
    <div>
        <!-- Write down the seed -->
        <div v-if="step == 1">
            <h6>Write This Down</h6>
            <p>
                Please save this seed somewhere secure; like a safe or security deposit box. You will need it later.
                <br><br><i><span class="text-danger">Warning:</span> This is your only opportunity!</i>
            </p>
            <b-card>
                {{ mnemonic }}
            </b-card>
        </div>

        <!-- Confirm word order -->
        <b-row v-if="step == 2">
            <b-col cols="12" class="mb-3">
                <b-button variant="transparent" @click="step--">
                    <b-icon icon="chevron-left"></b-icon>
                    Back
                </b-button>
            </b-col>

            <b-col cols="12">
                <b-card :class="{'border-danger': isBadInput}">
                    {{ seedArrayAttempt.join(' ') }}
                </b-card>
            </b-col>

            <b-col
                v-for="(word, i) in seedArrayShuffled"
                :key="word + i"
                cols="4"
            >
                <b-button
                    @click="addWord(word, i)"
                    :variant="usedIndices.includes(i) ? 'outline-info' : 'info'"
                    class="mt-3"
                    block
                    :disabled="usedIndices.includes(i)"
                >{{ word }}</b-button>
            </b-col>
        </b-row>

        <div v-if="step == 3" class="my-5">
            <AnimatedCheck class="mx-auto"></AnimatedCheck>
        </div>

        <!-- Buttons -->
        <div v-show="step == 1" class="mt-2">
            <!-- Delete wallet -->
            <b-button class="float-left mr-1" variant="danger" size="sm" @click="$emit('delete')" :disabled="isDownloading">
                &nbsp;<b-icon icon="trash"></b-icon>&nbsp;
            </b-button>
            <!-- Download Encrypted Wallet JSON -->
            <div class="float-right">
                <b-button 
                    v-for="i in walletCount"
                    :key="i"
                    class="ml-1" 
                    @click="$emit('download', i)" 
                    :disabled="isDownloading" 
                    size="sm"
                >
                    <b-spinner v-show="isDownloading && walletDownloading == i" label="Loading..." small></b-spinner>
                    <b-icon v-show="!isDownloading && walletDownloading != i" icon="download"></b-icon>
                    {{ walletCount == 1 ? 'Consuming/Earning' : i == 1 ? 'Earning' : 'Consuming' }} (Encrypted)
                </b-button>
            </div>

            <!-- Confirm Seed Recorded -->
            <b-button class="float-right mt-4" variant="primary" @click="step++" block :disabled="isDownloading">I saved it somewhere safe</b-button>
        </div>
    </div>
</template>

<script>
import AnimatedCheck from '../common/AnimatedCheck.vue';

export default {
    props: {
        walletCount: {
            type: Number,
            required: true,
        },
        mnemonic: {
            type: String,
            required: true
        },
        isDownloading: {
            type: Boolean,
            required: false,
            default: false
        },
        walletDownloading: {
            type: Number,
            required: false,
            default: 1
        }
    },
    data() {
        return {
            seedArray: null,
            seedArrayAttempt: [],
            usedIndices: [], // disable buttons matching
            seedArrayShuffled: null,
            isWrittenDown: false,
            step: 1, // 1 = write down seed, 2 = confirm seed, 3 = success
            isBadInput: false, // seed confirmation input status ('false' until actual fail)
        }
    },
    methods: {
        addWord: function(word, index) {
            this.seedArrayAttempt.push(word);
            this.usedIndices.push(index);
        },
        resetChallenge: function() {
            this.seedArrayShuffled = this.utils.shuffle([...this.seedArray]);
            this.usedIndices = [];
            this.seedArrayAttempt = [];
            this.isBadInput = false;
        }
    },
    watch: {
        step: function(currentStep, lastStep) {
            // reset challenge is user goes back to visable seed
            if(currentStep == 1 && lastStep == 2) {
                this.resetChallenge();
            }

        },
        seedArrayAttempt: function() {
            if(this.seedArrayAttempt.length == this.seedArray.length) {
                if(this.seedArrayAttempt.join(' ') == this.seedArray.join(' ')) {
                    // user inputted seed correctly!
                    this.step++;
                    // delay modal closer by 1.5s
                    setTimeout(() => {
                        this.$emit('confirmed');
                    }, 1750)
                } else {
                    // bad seed input
                    this.isBadInput = true;
                    setTimeout(() => {
                        this.resetChallenge()
                    }, 1750);
                }
            }
        }
    },
    mounted() {
        this.seedArray = this.mnemonic.split(' ');
        this.resetChallenge();
    },
    components: {
        AnimatedCheck
    }
}
</script>