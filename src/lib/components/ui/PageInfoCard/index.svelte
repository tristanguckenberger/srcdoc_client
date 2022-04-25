<script>

</script>

<div class="info-card-container">
    <div class="header-row">
        <div class="image">
            <slot name="image"/>
        </div>
        <div class="text">
            <div class="text-line primary">
                <slot name="primary-text"/>
            </div>
            <div class="text-line secondary">
                <slot name="secondary-text"/>
            </div>
        </div>
    </div>
    <div class="body-row">
        <slot name="info-content" />
    </div>
    <div class="footer-row">
        <slot name="additional-content"/>
    </div>
</div>

<style lang="scss">
    .info-card-container {
        display: flex;
        flex-direction: column;
        // background: red;

        .header-row {
            display: flex;
            flex-direction: row;

            .image {
                // background-color: blue;
                
                padding: 10px 10px 10px 10px;
                width: 75px;
                height: 75px;
                &>:global(div.image-slot) {
                    height: 100%;
                    :global(.image-container) {
                        // background-color: red;
                        height: 100%;
                        border-radius: 6px;
                        background-image: var(--profilePic);
                        background-repeat: no-repeat;
                        background-size: cover;
                    }
                }
            }
            .text {
                flex-grow: 1;
                padding: 10px;
                display: flex;
                flex-direction: column;
                justify-content: space-around;

                .text-line {
                    padding: 5px;

                    &>:global(div.primary-text) {
                        font-weight: 500 !important;
                    }
                }
            }
        }
        .body-row {
            :global(.info-container) {
                padding: 0 10px 0 10px;
                &> p {

                }
            }

        }
        .footer-row {
            
        }
    }

   


</style>