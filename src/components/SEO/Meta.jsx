import React from "react";
import PropTypes from "prop-types";
import { Helmet } from "react-helmet";

const Meta = ({title, description, keywords}) =>  {
    return (
        <Helmet>
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
        </Helmet>
    );
};

Meta.PropTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    keywords: PropTypes.string.isRequired,
}


export default Meta;
