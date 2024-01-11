<%- include('../partials/user/header.ejs') %>
    <main class="main">
        <div class="page-header text-center" style="background-image: url('userAssets/images/page-header-bg.jpg')">
            <div class="container">
                <h1 class="page-title">Products<span>Elements</span></h1>
            </div><!-- End .container -->
        </div><!-- End .page-header -->
        <nav aria-label="breadcrumb" class="breadcrumb-nav">
            <div class="container">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="index.html">Home</a></li>
                    <li class="breadcrumb-item"><a href="elements-list.html">Elements</a></li>
                    <li class="breadcrumb-item active" aria-current="page">Products</li>
                </ol>
            </div><!-- End .container -->
        </nav><!-- End .breadcrumb-nav -->

        <div class="page-content">
            <div class="container">
                <div class="owl-carousel owl-simple carousel-equal-height carousel-with-shadow" data-toggle="owl"
                    data-owl-options='{
                            "nav": false, 
                            "dots": false,
                            "margin": 20,
                            "loop": false,
                            "responsive": {
                                "0": {
                                    "items":2
                                },
                                "480": {
                                    "items":2
                                },
                                "992": {
                                    "items":3
                                },
                                "1200": {
                                    "items":4
                                }
                            }
                        }'>

                    <% for(let i=0;i<ProductDB.length;i++){%>
                        <div class="product product-2">
                            <figure class="product-media">
                                <span class="product-label label-circle label-sale">Sale</span>
                                <a href="/productDetails?id=<%= ProductDB[i]._id %>">
                                    <img src="/images/products/<%= ProductDB[i].images[0] %>" alt="Product image"
                                        class="product-image">
                                </a>


                                <div class="product-action-vertical">
                                    <a href="#" class="btn-product-icon btn-wishlist btn-expandable"><span>add to
                                            wishlist</span></a>
                                </div><!-- End .product-action -->

                                <div class="product-action product-action-dark">
                                    <a href="#" class="btn-product btn-cart"><span>add to cart</span></a>
                                    <a href="popup/quickView.html" class="btn-product btn-quickview"
                                        title="Quick view"><span>quick view</span></a>
                                </div><!-- End .product-action -->
                            </figure><!-- End .product-media -->

                            <div class="product-body">
                                <div class="product-cat">
                                    <a href="#">
                                        <%= ProductDB[i].category %>
                                    </a>
                                </div><!-- End .product-cat -->
                                <h3 class="product-title"><a href="product.html">
                                        <%= ProductDB[i].name %>
                                    </a></h3><!-- End .product-title -->
                                <div class="product-price">
                                    <span class="new-price">$<%= ProductDB[i].price %></span>
                                    <!-- <span class="old-price">$84.00</span> -->
                                </div><!-- End .product-price -->
                                <div class="ratings-container">
                                    <div class="ratings">
                                        <div class="ratings-val" style="width: 40%;"></div><!-- End .ratings-val -->
                                    </div><!-- End .ratings -->
                                    <span class="ratings-text">( 4 Reviews )</span>
                                </div><!-- End .rating-container -->

                            </div><!-- End .product-body -->
                        </div><!-- End .product -->

                        <%}%>
                </div><!-- End .owl-carousel -->
                <hr class="mt-0 mb-5" />

                <nav aria-label="Page navigation">
                    <ul class="pagination justify-content-center">
                        <li class="page-item <%= currentPage === 1 ? 'disabled' : '' %>">
                            <a class="page-link page-link-prev"
                                href="<%= currentPage > 1 ? '/productList?page=' + (currentPage - 1) : '#' %>"
                                aria-label="Previous" tabindex="-1" aria-disabled="<%= currentPage === 1 %>">
                                <span aria-hidden="true"><i class="icon-long-arrow-left"></i></span>Prev
                            </a>
                        </li>

                        <% for (let i=1; i <=totalPages; i++) { %>
                            <li class="page-item <%= currentPage === i ? 'active' : '' %>" aria-current="page">
                                <a class="page-link" href="/productList?page=<%= i %>">
                                    <%= i %>
                                </a>
                            </li>
                            <% } %>

                                <li class="page-item-total">of <%= totalPages %>
                                </li>

                                <li class="page-item <%= currentPage === totalPages ? 'disabled' : '' %>">
                                    <a class="page-link page-link-next"
                                        href="<%= currentPage < totalPages ? '/productList?page=' + (currentPage + 1) : '#' %>"
                                        aria-label="Next" tabindex="<%= currentPage === totalPages ? '-1' : '0' %>"
                                        aria-disabled="<%= currentPage === totalPages %>">
                                        Next <span aria-hidden="true"><i class="icon-long-arrow-right"></i></span>
                                    </a>
                                </li>
                    </ul>
                </nav>

            </div><!-- End .container -->
        </div><!-- End .page-content -->
    </main><!-- End .main -->
    </div><!-- End .page-wrapper -->
    <button id="scroll-top" title="Back to Top"><i class="icon-arrow-up"></i></button>
    <%- include('../partials/user/footer.ejs') %>