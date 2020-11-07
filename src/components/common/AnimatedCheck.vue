<template>
    <div style="width: 100px; height: 100px; font-size: 100px;">
        <b-icon icon="circle" variant="success" scale="0.8" class="p-abs"></b-icon>
        <div class="p-abs icon-revealer">
            <b-icon icon="check2" variant="success"></b-icon>
        </div>
    </div>
</template>

<style scoped>
    .p-abs {
        position: absolute;
    }
    .icon-revealer {
        display: block;
        margin-top: -9px;
        margin-left: 9px;
        width: 50px;
        overflow: hidden;
        animation: 1s linear forwards reveal;
    }

    @keyframes reveal {
        0% {
            width: 0px;
        }

        100% {
            width: 120px;
        }
    }
</style>